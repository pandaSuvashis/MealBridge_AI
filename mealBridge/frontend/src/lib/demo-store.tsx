'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Donation,
  Recipient,
  ActivityEvent,
  ImpactStats,
  UserRole,
  FoodCategory,
} from '@/types';
import {
  INITIAL_DONATIONS,
  INITIAL_RECIPIENTS,
  INITIAL_ACTIVITIES,
  DEMO_ROLES,
  getSeededDonations,
} from './demo-data';
import { evaluateUrgency } from './urgency';

interface NewDonationInput {
  foodName: string;
  category: FoodCategory;
  quantityKg: number;
  donorName: string;
  donorType: 'Campus Mess' | 'Cafeteria' | 'Bakery' | 'Tech Park Dining' | 'Event Hall';
  pickupLocation: string;
  locationArea: string;
  preparationTime: string;
  pickupDeadline: string;
  foodNotes: string;
}

interface DemoContextType {
  donations: Donation[];
  recipients: Recipient[];
  activities: ActivityEvent[];
  currentRole: UserRole;
  stats: ImpactStats;
  urgentDonations: Donation[];
  unreadAlertCount: number;
  createDonation: (input: NewDonationInput) => Donation;
  claimDonation: (donationId: string, recipientId?: string) => { success: boolean; code?: string; error?: string };
  verifyPickupCode: (donationId: string, codeInput: string) => { success: boolean; error?: string };
  markAsDelivered: (donationId: string) => { success: boolean; error?: string };
  resetDemoData: () => void;
  switchRole: (roleId: string) => void;
  isLoaded: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

const STORAGE_KEY = 'mealbridge_demo_store_v1';

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [currentRole, setCurrentRole] = useState<UserRole>(DEMO_ROLES[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clientTimeMs, setClientTimeMs] = useState<number | null>(null);

  // Load from localStorage or initialize relative timestamps on client mount
  useEffect(() => {
    const now = Date.now();
    setClientTimeMs(now);

    const timer = setInterval(() => {
      setClientTimeMs(Date.now());
    }, 30000);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.donations && Array.isArray(parsed.donations)) {
          setDonations(parsed.donations);
        }
        if (parsed.recipients && Array.isArray(parsed.recipients)) {
          setRecipients(parsed.recipients);
        }
        if (parsed.activities && Array.isArray(parsed.activities)) {
          setActivities(parsed.activities);
        }
        if (parsed.roleId) {
          const matchingRole = DEMO_ROLES.find((r) => r.id === parsed.roleId);
          if (matchingRole) setCurrentRole(matchingRole);
        }
      } else {
        // First client load: refresh relative times to current client moment
        setDonations(getSeededDonations(now));
      }
    } catch (err) {
      console.warn('Failed to parse saved MealBridge demo state:', err);
    } finally {
      setIsLoaded(true);
    }

    return () => clearInterval(timer);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          donations,
          recipients,
          activities,
          roleId: currentRole.id,
        })
      );
    } catch (err) {
      console.error('Failed to persist MealBridge demo state:', err);
    }
  }, [donations, recipients, activities, currentRole, isLoaded]);

  // Derived stats
  const stats = useMemo<ImpactStats>(() => {
    const timeRef = clientTimeMs || undefined;
    const available = donations.filter((d) => d.status === 'available');
    const delivered = donations.filter((d) => d.status === 'delivered');
    const expired = donations.filter(
      (d) => d.status === 'expired' || evaluateUrgency(d, timeRef).isExpired
    );

    const totalAvailableKg = available.reduce((acc, d) => acc + d.quantityKg, 0);
    const totalAvailableCount = available.length;

    const urgentList = available.filter((d) => evaluateUrgency(d, timeRef).level === 'urgent');
    const urgentCount = urgentList.length;

    const completedPickups = delivered.length;
    const totalKgRescued = delivered.reduce((acc, d) => acc + d.quantityKg, 0);
    const estimatedMealsServed = Math.round(totalKgRescued * 2.5);
    const co2PreventedKg = Number((totalKgRescued * 2.1).toFixed(1));

    // Unique recipients served
    const uniqueRecipients = new Set(
      delivered.map((d) => d.claimedBy?.name).filter(Boolean)
    );
    const recipientsServedCount = Math.max(uniqueRecipients.size, delivered.length > 0 ? 4 : 0);

    const totalResolved = completedPickups + expired.length;
    const completionRatePercent =
      totalResolved > 0 ? Math.round((completedPickups / totalResolved) * 100) : 92;

    return {
      totalAvailableKg,
      totalAvailableCount,
      urgentCount,
      completedPickups,
      totalKgRescued,
      estimatedMealsServed,
      co2PreventedKg,
      recipientsServedCount,
      completionRatePercent,
    };
  }, [donations, clientTimeMs]);

  // Urgent donations list
  const urgentDonations = useMemo(() => {
    const timeRef = clientTimeMs || undefined;
    return donations.filter(
      (d) => d.status === 'available' && evaluateUrgency(d, timeRef).level === 'urgent'
    );
  }, [donations, clientTimeMs]);

  const unreadAlertCount = urgentDonations.length;

  // Actions
  const createDonation = useCallback((input: NewDonationInput): Donation => {
    const nowIso = new Date().toISOString();
    const newId = `don-${Date.now().toString().slice(-4)}`;
    const newDonation: Donation = {
      ...input,
      id: newId,
      status: 'available',
      createdAt: nowIso,
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      type: 'created',
      donationId: newId,
      foodName: newDonation.foodName,
      quantityKg: newDonation.quantityKg,
      actor: input.donorName,
      description: `New surplus food listing created (${input.quantityKg} kg of ${input.foodName}) at ${input.locationArea}.`,
    };

    setDonations((prev) => [newDonation, ...prev]);
    setActivities((prev) => [newActivity, ...prev]);

    return newDonation;
  }, []);

  const claimDonation = useCallback(
    (donationId: string, recipientId?: string) => {
      const target = donations.find((d) => d.id === donationId);
      if (!target) {
        return { success: false, error: 'Donation not found.' };
      }

      if (target.status !== 'available') {
        return {
          success: false,
          error: `Cannot claim: donation is currently marked as "${target.status}".`,
        };
      }

      const urgency = evaluateUrgency(target, clientTimeMs || undefined);
      if (urgency.isExpired) {
        return {
          success: false,
          error: 'Cannot claim: this donation has already passed its pickup deadline.',
        };
      }

      const recipient = recipientId
        ? recipients.find((r) => r.id === recipientId)
        : recipients[0];

      const recipientName = recipient?.name || 'Authorized Rescue Partner';
      const recipientType = recipient?.type || 'NGO';

      const generatedCode = `MB-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const updatedDonation: Donation = {
        ...target,
        status: 'claimed',
        pickupCode: generatedCode,
        claimedBy: {
          id: recipient?.id || 'rec-custom',
          name: recipientName,
          type: recipientType,
          claimedAt: nowIso,
        },
      };

      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: nowIso,
        type: 'claimed',
        donationId: target.id,
        foodName: target.foodName,
        quantityKg: target.quantityKg,
        actor: recipientName,
        description: `Claimed for pickup. Verification pass ${generatedCode} generated for dispatch.`,
      };

      setDonations((prev) => prev.map((d) => (d.id === donationId ? updatedDonation : d)));
      setActivities((prev) => [newActivity, ...prev]);

      return { success: true, code: generatedCode };
    },
    [donations, recipients, clientTimeMs]
  );

  const verifyPickupCode = useCallback((donationId: string, codeInput: string) => {
    const target = donations.find((d) => d.id === donationId);
    if (!target) {
      return { success: false, error: 'Donation not found.' };
    }

    if (target.status !== 'claimed') {
      return {
        success: false,
        error: `Invalid action: donation must be in "claimed" state to verify pickup (current status: ${target.status}).`,
      };
    }

    const cleanInput = codeInput.trim().toUpperCase();
    const expected = (target.pickupCode || '').trim().toUpperCase();

    if (cleanInput !== expected) {
      return {
        success: false,
        error: `Incorrect verification code "${cleanInput}". Please cross-check with the authorized collector's pass.`,
      };
    }

    const nowIso = new Date().toISOString();
    const updatedDonation: Donation = {
      ...target,
      status: 'collected',
      collectedAt: nowIso,
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      type: 'collected',
      donationId: target.id,
      foodName: target.foodName,
      quantityKg: target.quantityKg,
      actor: target.claimedBy?.name || 'Assigned Collector',
      description: `Pickup verified via code ${expected}. Food collected and en route to community beneficiaries.`,
    };

    setDonations((prev) => prev.map((d) => (d.id === donationId ? updatedDonation : d)));
    setActivities((prev) => [newActivity, ...prev]);

    return { success: true };
  }, [donations]);

  const markAsDelivered = useCallback((donationId: string) => {
    const target = donations.find((d) => d.id === donationId);
    if (!target) {
      return { success: false, error: 'Donation not found.' };
    }

    if (target.status !== 'collected') {
      return {
        success: false,
        error: `Donation must be collected before marking as delivered (current status: ${target.status}).`,
      };
    }

    const nowIso = new Date().toISOString();
    const updatedDonation: Donation = {
      ...target,
      status: 'delivered',
      deliveredAt: nowIso,
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      type: 'delivered',
      donationId: target.id,
      foodName: target.foodName,
      quantityKg: target.quantityKg,
      actor: target.claimedBy?.name || 'Rescue Team',
      description: `Delivery completed! Rescued ${target.quantityKg} kg (~${Math.round(target.quantityKg * 2.5)} meals) successfully served.`,
    };

    setDonations((prev) => prev.map((d) => (d.id === donationId ? updatedDonation : d)));
    setActivities((prev) => [newActivity, ...prev]);

    return { success: true };
  }, [donations]);

  const resetDemoData = useCallback(() => {
    const now = Date.now();
    setDonations(getSeededDonations(now));
    setRecipients(INITIAL_RECIPIENTS);
    setActivities(INITIAL_ACTIVITIES);
    setCurrentRole(DEMO_ROLES[0]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Error clearing localStorage:', err);
    }
  }, []);

  const switchRole = useCallback((roleId: string) => {
    const match = DEMO_ROLES.find((r) => r.id === roleId);
    if (match) {
      setCurrentRole(match);
    }
  }, []);

  const value = useMemo(
    () => ({
      donations,
      recipients,
      activities,
      currentRole,
      stats,
      urgentDonations,
      unreadAlertCount,
      createDonation,
      claimDonation,
      verifyPickupCode,
      markAsDelivered,
      resetDemoData,
      switchRole,
      isLoaded,
    }),
    [
      donations,
      recipients,
      activities,
      currentRole,
      stats,
      urgentDonations,
      unreadAlertCount,
      createDonation,
      claimDonation,
      verifyPickupCode,
      markAsDelivered,
      resetDemoData,
      switchRole,
      isLoaded,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore(): DemoContextType {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoStore must be used within a DemoProvider');
  }
  return context;
}
