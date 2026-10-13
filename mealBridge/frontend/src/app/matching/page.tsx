'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Phone, PhoneCall } from 'lucide-react';
import { DonationCard } from '@/components/donations/DonationCard';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import { evaluateUrgency } from '@/lib/urgency';

function DonorCallsPage() {
  const searchParams = useSearchParams();
  const selectedDonationId = searchParams.get('donationId');
  const { donations, currentTime } = useMealBridgeStore();
  const availableDonations = useMemo(() => {
    const available = donations.filter((donation) =>
      donation.status === 'available' && !evaluateUrgency(donation, currentTime).isExpired,
    );
    return available.sort((left, right) =>
      left.id === selectedDonationId ? -1 : right.id === selectedDonationId ? 1 : 0,
    );
  }, [donations, currentTime, selectedDonationId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <section className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800">
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Call Donors Directly</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Choose available food and call the donor to agree on collection. Calling does not reserve food; the donor can confirm availability and pickup details.
            </p>
          </div>
        </div>
      </section>

      {availableDonations.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {availableDonations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-stone-200 bg-white p-10 text-center">
          <Phone className="mx-auto mb-3 h-8 w-8 text-stone-400" aria-hidden="true" />
          <h3 className="font-bold text-stone-900">No available food to call about</h3>
          <p className="mt-1 text-sm text-stone-600">New available donations will appear here.</p>
        </section>
      )}
    </div>
  );
}

export function DonorCallsPageFallback() {
  return <div className="p-8 text-center text-xs text-stone-500">Loading donor contacts…</div>;
}

export default function DonorCallsRoute() {
  return (
    <Suspense fallback={<DonorCallsPageFallback />}>
      <DonorCallsPage />
    </Suspense>
  );
}
