'use client';

import React from 'react';
import Link from 'next/link';
import { Donation } from '@/types';
import { evaluateUrgency } from '@/lib/urgency';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { MapPin, Users2, ArrowRight } from 'lucide-react';

interface DonationsTableProps {
  donations: Donation[];
}

export function DonationsTable({ donations }: DonationsTableProps) {
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200/90 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Food Item & Category</th>
              <th className="py-3.5 px-3 text-right">Quantity</th>
              <th className="py-3.5 px-4">Donor & Location</th>
              <th className="py-3.5 px-3">Deadline Window</th>
              <th className="py-3.5 px-3">Urgency</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {donations.map((donation) => {
              const urgency = evaluateUrgency(donation);
              const isClaimable = donation.status === 'available' && !urgency.isExpired;

              return (
                <tr
                  key={donation.id}
                  className={`hover:bg-stone-50/70 transition-colors ${
                    urgency.level === 'urgent' && donation.status === 'available'
                      ? 'bg-amber-50/30'
                      : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-stone-900 text-xs sm:text-sm">
                      {donation.foodName}
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {donation.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {donation.quantityKg}
                    </span>{' '}
                    <span className="text-stone-500 text-[11px]">kg</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-stone-800 truncate">{donation.donorName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                      <span className="truncate">{donation.locationArea}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <p className="text-stone-800 font-medium text-xs">
                        {formatTime(donation.pickupDeadline)}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Prep: {formatTime(donation.preparationTime)}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <UrgencyBadge evaluation={urgency} showRemainingText={false} />
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <StatusBadge status={donation.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/matching?donationId=${donation.id}`}
                        className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-emerald-800 transition-colors"
                        title="Match Recipient"
                      >
                        <Users2 className="w-4 h-4" />
                      </Link>

                      {isClaimable ? (
                        <Link
                          href={`/pickup?claimId=${donation.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs"
                        >
                          <span>Claim</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : donation.status === 'claimed' ? (
                        <Link
                          href={`/pickup`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <span>Verify</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-stone-400 px-2 py-1">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
