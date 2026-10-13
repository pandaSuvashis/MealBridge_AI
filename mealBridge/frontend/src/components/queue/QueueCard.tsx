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
  Phone,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface QueueCardProps {
  donation: Donation;
  rank: number;
}

export function QueueCard({ donation, rank }: QueueCardProps) {
  const { currentTime } = useMealBridgeStore();
  const urgency = evaluateUrgency(donation, currentTime);

  const isExpired = urgency.isExpired || donation.status === 'expired';
  const isAvailable = donation.status === 'available' && !isExpired;

  return (
    <div
      className={`rounded-xl border transition-all p-5 bg-white shadow-2xs ${
        urgency.level === 'urgent' && isAvailable
          ? 'border-amber-300 ring-1 ring-amber-200/60 shadow-xs'
          : isExpired
          ? 'border-stone-200 bg-stone-50/50 opacity-80'
          : 'border-stone-200/90 hover:border-stone-300'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Priority Rank + Food Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Priority Rank Indicator */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
              urgency.level === 'urgent' && isAvailable
                ? 'bg-amber-600 text-white shadow-2xs'
                : isExpired
                ? 'bg-stone-200 text-stone-600'
                : 'bg-emerald-800 text-white'
            }`}
          >
            #{rank}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-stone-900 truncate">
                {donation.foodName}
              </h3>
              <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-200">
                {donation.quantityKg} kg
              </span>
              <StatusBadge status={donation.status} size="sm" />
              <UrgencyBadge evaluation={urgency} showRemainingText={true} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
              <span className="flex items-center gap-1 font-medium text-stone-800">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                {donation.donorName}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-stone-500">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {donation.locationArea}
              </span>
              <span>·</span>
              <span className="text-stone-500">
                Category: <strong className="text-stone-700">{donation.category}</strong>
              </span>
              <span>·</span>
              <span className="text-stone-500">
                Deadline: <strong>{formatTime(donation.pickupDeadline)}</strong>
              </span>
            </div>

            {/* Explainable Urgency Reason */}
            <div
              className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                urgency.level === 'urgent' && isAvailable
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : isExpired
                  ? 'bg-stone-100 text-stone-600 border-stone-200'
                  : 'bg-emerald-50/60 text-emerald-900 border-emerald-200/60'
              }`}
            >
              <Info
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  urgency.level === 'urgent' && isAvailable
                    ? 'text-amber-700'
                    : isExpired
                    ? 'text-stone-500'
                    : 'text-emerald-700'
                }`}
              />
              <div>
                <span className="font-semibold mr-1">Priority Rule:</span>
                <span>{urgency.explanation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 lg:flex-col lg:items-end lg:justify-center shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
          {isAvailable ? (
            donation.donorPhone ? (
              <a
                href={`tel:${donation.donorPhone.replace(/[^\d+]/g, '')}`}
                aria-label={`Call donor ${donation.donorName}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs w-full lg:w-36 text-center"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Donor</span>
              </a>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-stone-100 text-stone-500 text-xs font-medium text-center w-full lg:w-36">
                Phone unavailable
              </div>
            )
          ) : isExpired ? (
            <div className="px-3 py-2 rounded-lg bg-stone-100 text-stone-500 text-xs font-medium text-center w-full lg:w-36">
              Non-Claimable (Expired)
            </div>
          ) : donation.status === 'claimed' ? (
            <Link
              href="/pickup"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors w-full lg:w-36 text-center"
            >
              <span>Enter Pickup Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium text-center flex items-center gap-1 justify-center w-full lg:w-36">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rescued</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
