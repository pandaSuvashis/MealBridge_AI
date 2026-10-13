'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import { VerificationPanel } from '@/components/pickup/VerificationPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { evaluateUrgency } from '@/lib/urgency';
import {
  QrCode,
  Truck,
  CheckCircle2,
  Phone,
  Building,
} from 'lucide-react';

function PickupVerificationContent() {
  const searchParams = useSearchParams();
  const claimIdFromUrl = searchParams.get('claimId');

  const { donations, currentTime } = useMealBridgeStore();

  // Active pickups (claimed or collected)
  const activePickups = useMemo(() => {
    return donations.filter((d) => ['claimed', 'collected'].includes(d.status));
  }, [donations]);

  // Claimable donations
  const claimableDonations = useMemo(() => {
    return donations.filter(
      (d) => d.status === 'available' && !evaluateUrgency(d, currentTime).isExpired
    );
  }, [donations, currentTime]);

  // Selected item to verify
  const [selectedPickupId, setSelectedPickupId] = useState<string>(() => {
    if (claimIdFromUrl && donations.some((d) => d.id === claimIdFromUrl)) {
      return claimIdFromUrl;
    }
    return activePickups[0]?.id || claimableDonations[0]?.id || '';
  });

  const selectedDonation = useMemo(() => {
    return (
      donations.find((d) => d.id === selectedPickupId) ||
      activePickups[0] ||
      claimableDonations[0]
    );
  }, [donations, selectedPickupId, activePickups, claimableDonations]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-800" />
              <span>Pickup Verification &amp; Chain of Custody</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Secure physical handover workflow: Available &rarr; Claimed &rarr; Collected &rarr; Delivered
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Simulated Handover Protocol
          </span>
        </div>
      </div>

      {/* Main Grid: Verification Panel & Active Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Verification Stepper & Handover Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDonation ? (
            <div className="space-y-4">
              {/* Selected Donation Header Overview */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-stone-900">
                      {selectedDonation.foodName}
                    </span>
                    <span className="font-mono text-xs font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      {selectedDonation.quantityKg} kg
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedDonation.donorName}</span>
                    <span>·</span>
                    <span>{selectedDonation.pickupLocation}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedDonation.status} size="sm" />
                  <UrgencyBadge evaluation={evaluateUrgency(selectedDonation, currentTime)} showRemainingText={false} />
                </div>
              </div>

              {/* Available donations require direct donor contact before the handover workflow. */}
              {selectedDonation.status === 'available' ? (
                <div className="bg-white rounded-xl border border-stone-200/90 p-6 shadow-2xs text-center space-y-4">
                  <Phone className="w-10 h-10 text-emerald-800 mx-auto" />
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      Contact the Donor
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                      Call to confirm the food is still available and agree on the collection time and location. This does not reserve the donation.
                    </p>
                  </div>
                  {selectedDonation.donorPhone ? (
                    <a
                      href={`tel:${selectedDonation.donorPhone.replace(/[^\d+]/g, '')}`}
                      className="mx-auto inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-900"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call {selectedDonation.donorName}</span>
                    </a>
                  ) : (
                    <p className="text-xs font-medium text-stone-500">Donor phone number is not available for this older listing.</p>
                  )}
                </div>
              ) : (
                /* Verification Lifecycle Panel */
                <VerificationPanel donation={selectedDonation} />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">No active pickup selected</h3>
              <p className="text-xs text-stone-500">
                Choose a claimed donation from the active missions list on the right.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Active Missions & Claimable Queue */}
        <div className="space-y-6">
          {/* Active Missions (Claimed or Collected) */}
          <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-800" />
                <span>Active Missions ({activePickups.length})</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">In Progress</span>
            </div>

            <div className="space-y-2">
              {activePickups.length > 0 ? (
                activePickups.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedPickupId(d.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedDonation?.id === d.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-stone-900 truncate">
                        {d.foodName}
                      </p>
                      <StatusBadge status={d.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 truncate">
                      {d.donorName} · {d.quantityKg} kg
                    </p>
                    {d.claimedBy && (
                      <p className="text-[10px] text-emerald-800 font-medium mt-1 truncate">
                        Assigned: {d.claimedBy.name}
                      </p>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-3 text-center">
                  No pickups currently in transit.
                </p>
              )}
            </div>
          </div>

          {/* Available donations for direct donor contact */}
          <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">
              Call a Donor ({claimableDonations.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {claimableDonations.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg border border-stone-200 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-900 truncate">{d.foodName}</p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {d.quantityKg} kg · {d.donorName}
                    </p>
                  </div>
                  {d.donorPhone ? (
                    <a
                      href={`tel:${d.donorPhone.replace(/[^\d+]/g, '')}`}
                      aria-label={`Call donor ${d.donorName}`}
                      className="shrink-0 inline-flex items-center gap-1 rounded bg-emerald-800 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-900"
                    >
                      <Phone className="h-3 w-3" />
                      Call
                    </a>
                  ) : (
                    <span className="shrink-0 text-[10px] text-stone-500">No phone</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PickupVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-stone-500">
          Loading pickup verification interface...
        </div>
      }
    >
      <PickupVerificationContent />
    </Suspense>
  );
}
