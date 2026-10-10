'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import { calculateMatchRecommendations } from '@/lib/matching';
import { RecipientCard } from '@/components/matching/RecipientCard';
import { evaluateUrgency } from '@/lib/urgency';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import {
  Users2,
  Utensils,
  MapPin,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

function MatchingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDonationId = searchParams.get('donationId');

  const { donations, recipients, claimDonation } = useDemoStore();

  // Find candidate donations (available or claimed)
  const candidateDonations = useMemo(() => {
    return donations.filter((d) => d.status !== 'expired');
  }, [donations]);

  // Selected donation ID state
  const [selectedDonationId, setSelectedDonationId] = useState<string>(() => {
    if (urlDonationId && donations.some((d) => d.id === urlDonationId)) {
      return urlDonationId;
    }
    // Default to first available donation
    const firstAvailable = donations.find((d) => d.status === 'available');
    return firstAvailable ? firstAvailable.id : donations[0]?.id || '';
  });

  const selectedDonation = useMemo(() => {
    return donations.find((d) => d.id === selectedDonationId) || candidateDonations[0];
  }, [donations, selectedDonationId, candidateDonations]);

  // Compute explainable match recommendations for this selected donation
  const recommendations = useMemo(() => {
    if (!selectedDonation) return [];
    return calculateMatchRecommendations(selectedDonation, recipients);
  }, [selectedDonation, recipients]);

  // Action: assign recipient to selected donation
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  const handleAssign = (recipientId: string) => {
    if (!selectedDonation) return;
    const res = claimDonation(selectedDonation.id, recipientId);
    if (res.success) {
      setAssignedFeedback(
        `Assigned successfully! Verification code ${res.code} generated. Redirecting to pickup handover...`
      );
      setTimeout(() => {
        router.push(`/pickup?claimId=${selectedDonation.id}`);
      }, 1500);
    } else {
      alert(res.error || 'Failed to assign recipient');
    }
  };

  if (!selectedDonation) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <Users2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <h3 className="font-bold text-stone-800 text-base">No active donations found to match</h3>
      </div>
    );
  }

  const urgency = evaluateUrgency(selectedDonation);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Heuristic Disclaimer Banner */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-800" />
              <span>Transparent Recipient Recommendation</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Explainable matching score (0-100) based on vehicle payload capacity, campus transit time, and readiness
            </p>
          </div>

          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic Demo Rules (No Black Box)</span>
          </span>
        </div>

        {/* Explainable Rubric Notice */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="text-[11px] text-stone-600 space-y-0.5 leading-relaxed">
            <span className="font-semibold text-stone-800">Scoring Formula:</span> 35% Collection Capacity Margin + 35% Proximity / Transit Distance + 20% Standby Readiness + 10% Vehicle Cargo Fit. All figures are based on Hyderabad campus sample records.
          </div>
        </div>
      </div>

      {/* Donation Selector Card */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            Select Food Batch to Match:
          </label>
          <select
            value={selectedDonation.id}
            onChange={(e) => {
              setSelectedDonationId(e.target.value);
              setAssignedFeedback(null);
            }}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 max-w-md w-full"
          >
            {candidateDonations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.foodName} ({d.quantityKg} kg · {d.status})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Donation Pill Breakdown */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">{selectedDonation.foodName}</span>
              <span className="font-mono font-bold text-xs bg-white text-stone-800 px-2 py-0.5 rounded border border-emerald-200">
                {selectedDonation.quantityKg} kg
              </span>
              <StatusBadge status={selectedDonation.status} size="sm" />
              <UrgencyBadge evaluation={urgency} showRemainingText={true} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-stone-600">
              <span>Donor: <strong>{selectedDonation.donorName}</strong></span>
              <span>·</span>
              <span>Location: {selectedDonation.pickupLocation}</span>
              <span>·</span>
              <span>Category: {selectedDonation.category}</span>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium shrink-0">
            {recommendations.length} Recipient Partners Evaluated
          </div>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {assignedFeedback && (
        <div className="p-4 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{assignedFeedback}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-stone-900 text-base">
          Recommended Rescue Partners (Ranked by Match Score)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((rec) => {
            const isAssigned = selectedDonation.claimedBy?.id === rec.recipient.id;
            return (
              <RecipientCard
                key={rec.recipient.id}
                recommendation={rec}
                donation={selectedDonation}
                onAssign={handleAssign}
                isAssigned={isAssigned}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RecipientMatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-stone-500">
          Loading recipient matching engine...
        </div>
      }
    >
      <MatchingContent />
    </Suspense>
  );
}
