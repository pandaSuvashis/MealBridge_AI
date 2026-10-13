'use client';

import React from 'react';
import Link from 'next/link';
import { Donation } from '@/types';
import { evaluateUrgency } from '@/lib/urgency';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { formatTime } from '@/lib/format';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import {
  MapPin,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  Phone,
  FileText,
} from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  onClaim?: (donation: Donation) => void;
}

export function DonationCard({ donation }: DonationCardProps) {
  const { currentTime } = useMealBridgeStore();
  const urgency = evaluateUrgency(donation, currentTime);

  const isClaimable = donation.status === 'available' && !urgency.isExpired;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs ${
        urgency.level === 'urgent' && donation.status === 'available'
          ? 'border-amber-300 ring-1 ring-amber-200/60'
          : 'border-stone-200/90 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <StatusBadge status={donation.status} size="sm" />
          <UrgencyBadge evaluation={urgency} showRemainingText={true} />
        </div>

        {/* Header */}
        <div className="space-y-1 mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-stone-900 leading-snug">
              {donation.foodName}
            </h3>
            <span className="shrink-0 px-2 py-1 rounded-md bg-stone-100 font-mono text-xs font-bold text-stone-800 border border-stone-200">
              {donation.quantityKg} kg
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium text-[11px]">
              {donation.category}
            </span>
            <span>·</span>
            <span className="truncate">{donation.donorType}</span>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2 py-3 border-y border-stone-100 text-xs text-stone-600">
          <div className="flex items-start gap-2">
            <Building className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
            <span className="text-stone-800 font-medium truncate">{donation.donorName}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
            <span className="truncate text-stone-600" title={donation.pickupLocation}>
              {donation.pickupLocation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-stone-500">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>Prep: {formatTime(donation.preparationTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700 font-medium">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>Deadline: {formatTime(donation.pickupDeadline)}</span>
            </div>
          </div>

          {donation.foodNotes && (
            <div className="pt-1 flex items-start gap-1.5 text-[11px] text-stone-500 italic">
              <FileText className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{donation.foodNotes}</span>
            </div>
          )}
        </div>

        {/* Claimed by banner if applicable */}
        {donation.claimedBy && (
          <div className="mt-3 p-2 rounded-lg bg-blue-50/70 border border-blue-200/70 text-xs">
            <p className="text-blue-900 font-medium flex items-center justify-between">
              <span>Collector: {donation.claimedBy.name}</span>
              <span className="text-[10px] text-blue-700 font-semibold">{donation.claimedBy.type}</span>
            </p>
            {donation.pickupCode && (
              <p className="text-[11px] text-blue-700 mt-0.5 font-mono">
                Code: <span className="font-bold">{donation.pickupCode}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-stone-100">
        {isClaimable ? (
          donation.donorPhone ? (
            <a
              href={`tel:${donation.donorPhone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs"
              aria-label={`Call donor ${donation.donorName}`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Donor</span>
            </a>
          ) : (
            <span className="text-[11px] text-stone-500 font-medium">Donor phone unavailable</span>
          )
        ) : donation.status === 'claimed' ? (
          <Link
            href={`/pickup`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            <span>Enter Pickup Code</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[11px] text-stone-400 font-medium capitalize">
            {donation.status === 'expired' ? 'Lapsed' : donation.status}
          </span>
        )}
      </div>
    </div>
  );
}
