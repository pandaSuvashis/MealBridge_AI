'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { sortDonationsByUrgency, evaluateUrgency } from '@/lib/urgency';
import { QueueCard } from '@/components/queue/QueueCard';
import { CreateDonationModal } from '@/components/donations/CreateDonationModal';
import {
  Hourglass,
  AlertTriangle,
  Clock,
  Ban,
  Info,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function RescueQueuePage() {
  const { donations } = useDemoStore();
  const [filterTab, setFilterTab] = useState<'all' | 'urgent' | 'normal' | 'expired'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Sort all donations according to transparent priority rule
  const rankedItems = useMemo(() => {
    return sortDonationsByUrgency(donations);
  }, [donations]);

  // Tab filtered items
  const filteredRanked = useMemo(() => {
    if (filterTab === 'all') return rankedItems;
    return rankedItems.filter((item) => {
      if (filterTab === 'expired') {
        return item.evaluation.isExpired || item.donation.status === 'expired';
      }
      return item.evaluation.level === filterTab && !item.evaluation.isExpired;
    });
  }, [rankedItems, filterTab]);

  const urgentCount = rankedItems.filter(
    (i) => i.evaluation.level === 'urgent' && i.donation.status === 'available'
  ).length;

  const normalCount = rankedItems.filter(
    (i) => i.evaluation.level === 'normal' && i.donation.status === 'available'
  ).length;

  const expiredCount = rankedItems.filter(
    (i) => i.evaluation.isExpired || i.donation.status === 'expired'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Urgency Algorithm Explanation Banner */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-amber-700" />
              <span>Urgency-Based Rescue Queue</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Automated prioritization engine ranking surplus food lots by pickup deadline and perishability
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch to Queue</span>
          </button>
        </div>

        {/* Explainable Queue Logic Callout */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900">
            <Info className="w-4 h-4 text-emerald-800" />
            <span>Transparent Queue Priority Rules</span>
          </div>
          <p className="text-stone-600 leading-relaxed text-[11px]">
            1. <strong>Urgent Tier:</strong> Active listings with &le; 2 hours remaining until safe pickup window closes. Cooked hot meals receive elevated urgency weight to avoid temperature abuse.
            <br />
            2. <strong>Normal Tier:</strong> Surplus food with &gt; 2 hours buffer, queued for scheduled batch volunteer runs.
            <br />
            3. <strong>Expired Safeguard:</strong> Listings past their safe consumption deadline are automatically marked expired and disabled from pickup claiming.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/80 pb-3">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'all'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          All Queue Items ({rankedItems.length})
        </button>

        <button
          onClick={() => setFilterTab('urgent')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterTab === 'urgent'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Urgent Only ({urgentCount})</span>
        </button>

        <button
          onClick={() => setFilterTab('normal')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterTab === 'normal'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Normal Buffer ({normalCount})</span>
        </button>

        <button
          onClick={() => setFilterTab('expired')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterTab === 'expired'
              ? 'bg-stone-700 text-white shadow-2xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Expired / Inactive ({expiredCount})</span>
        </button>
      </div>

      {/* Ranked Queue Cards List */}
      {filteredRanked.length > 0 ? (
        <div className="space-y-3.5">
          {filteredRanked.map((item, index) => (
            <QueueCard
              key={item.donation.id}
              donation={item.donation}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-stone-900 text-base">No listings in this queue tab</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Switch tabs to inspect other priority brackets or register a new surplus donation.
          </p>
        </div>
      )}

      {/* Creation Modal */}
      <CreateDonationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
