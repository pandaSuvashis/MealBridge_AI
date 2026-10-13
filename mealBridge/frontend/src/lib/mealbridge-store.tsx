'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ActivityEvent, Donation, ImpactStats, Recipient } from '@/types';
import { evaluateUrgency } from '@/lib/urgency';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

type DonationInput = Omit<Donation, 'id' | 'status' | 'createdAt' | 'pickupCode' | 'claimedBy' | 'collectedAt' | 'deliveredAt' | 'analyticsIncluded' | 'donorPhone'> & { donorPhone: string };
type ApiError = { error?: { message?: string } };
type ActionResult = { success: boolean; code?: string; error?: string };

const emptyStats: ImpactStats = {
  totalAvailableKg: 0, totalAvailableCount: 0, urgentCount: 0, completedPickups: 0,
  totalKgRescued: 0, estimatedMealsServed: 0, co2PreventedKg: 0, recipientsServedCount: 0, completionRatePercent: 0,
};

interface MealBridgeContextType {
  donations: Donation[];
  recipients: Recipient[];
  activities: ActivityEvent[];
  stats: ImpactStats;
  currentTime: number;
  urgentDonations: Donation[];
  isLoaded: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDonation: (input: DonationInput) => Promise<Donation>;
  claimDonation: (donationId: string, recipientId?: string) => Promise<ActionResult>;
  verifyPickupCode: (donationId: string, code: string) => Promise<ActionResult>;
  markAsDelivered: (donationId: string) => Promise<ActionResult>;
}

const MealBridgeContext = createContext<MealBridgeContextType | null>(null);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session }, error: sessionError } = await createSupabaseBrowserClient().auth.getSession();
  if (sessionError) throw new Error(`Could not read the sign-in session: ${sessionError.message}`);
  if (!session?.access_token) throw new Error('Sign in to use MealBridge.');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...init?.headers,
    },
  });
  const payload = await response.json() as { success: boolean; data?: T } & ApiError;
  if (!response.ok || !payload.success) throw new Error(payload.error?.message ?? 'The server could not process this request.');
  return payload.data as T;
}

const toActivity = (donation: Donation): ActivityEvent => ({
  id: `delivered-${donation.id}`,
  timestamp: donation.deliveredAt ?? donation.createdAt,
  type: 'delivered',
  donationId: donation.id,
  foodName: donation.foodName,
  quantityKg: donation.quantityKg,
  actor: donation.claimedBy?.name ?? 'Rescue partner',
  description: `${donation.quantityKg} kg successfully delivered.`,
});

export function MealBridgeProvider({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<ImpactStats>(emptyStats);
  const [currentTime, setCurrentTime] = useState(() => new Date('2026-10-10T13:00:00.000Z').getTime());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => setCurrentTime(Date.now());
    updateClock();
    const interval = setInterval(updateClock, 30_000);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [nextDonations, nextStats, delivered, nextRecipients] = await Promise.all([
        request<Donation[]>('/donations'), request<ImpactStats>('/impact'), request<Donation[]>('/impact/activity'), request<Recipient[]>('/participants'),
      ]);
      setError(null);
      setDonations(nextDonations);
      setStats(nextStats);
      setActivities(delivered.map(toActivity));
      setRecipients(nextRecipients);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to reach the MealBridge API.');
      setDonations([]);
      setRecipients([]);
      setActivities([]);
      setStats(emptyStats);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void Promise.resolve().then(refresh);
  }, [enabled, refresh]);

  const createDonation = useCallback(async (input: DonationInput) => {
    const donation = await request<Donation>('/donations', { method: 'POST', body: JSON.stringify(input) });
    setDonations((current) => [donation, ...current]);
    void refresh();
    return donation;
  }, [refresh]);

  const claimDonation = useCallback(async (donationId: string, recipientId?: string): Promise<ActionResult> => {
    try {
      const data = await request<{ donation: Donation; pickupCode: string }>(`/donations/${donationId}/claim`, { method: 'POST', body: JSON.stringify(recipientId ? { recipientId } : {}) });
      setDonations((current) => current.map((donation) => donation.id === donationId ? { ...data.donation, pickupCode: data.pickupCode } : donation));
      void refresh();
      return { success: true, code: data.pickupCode };
    } catch (actionError) {
      return { success: false, error: actionError instanceof Error ? actionError.message : 'Claim failed.' };
    }
  }, [refresh]);

  const verifyPickupCode = useCallback(async (donationId: string, pickupCode: string): Promise<ActionResult> => {
    try {
      const donation = await request<Donation>(`/donations/${donationId}/verify-pickup`, { method: 'POST', body: JSON.stringify({ pickupCode }) });
      setDonations((current) => current.map((item) => item.id === donationId ? { ...donation, pickupCode: item.pickupCode } : item));
      void refresh();
      return { success: true };
    } catch (actionError) {
      return { success: false, error: actionError instanceof Error ? actionError.message : 'Verification failed.' };
    }
  }, [refresh]);

  const markAsDelivered = useCallback(async (donationId: string): Promise<ActionResult> => {
    try {
      const donation = await request<Donation>(`/donations/${donationId}/complete`, { method: 'POST' });
      setDonations((current) => current.map((item) => item.id === donationId ? donation : item));
      void refresh();
      return { success: true };
    } catch (actionError) {
      return { success: false, error: actionError instanceof Error ? actionError.message : 'Could not complete delivery.' };
    }
  }, [refresh]);

  const urgentDonations = useMemo(() => donations.filter((donation) => donation.status === 'available' && evaluateUrgency(donation, currentTime).level === 'urgent'), [donations, currentTime]);
  const value = useMemo(() => ({ donations, recipients, activities, stats, currentTime, urgentDonations, isLoaded, error, refresh, createDonation, claimDonation, verifyPickupCode, markAsDelivered }), [donations, recipients, activities, stats, currentTime, urgentDonations, isLoaded, error, refresh, createDonation, claimDonation, verifyPickupCode, markAsDelivered]);
  return <MealBridgeContext.Provider value={value}>{children}</MealBridgeContext.Provider>;
}

export function useMealBridgeStore(): MealBridgeContextType {
  const context = useContext(MealBridgeContext);
  if (!context) throw new Error('useMealBridgeStore must be used within MealBridgeProvider.');
  return context;
}
