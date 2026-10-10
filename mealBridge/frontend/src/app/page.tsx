'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/demo-store';
import { evaluateUrgency } from '@/lib/urgency';
import { StatCard } from '@/components/ui/StatCard';
import { DonationCard } from '@/components/donations/DonationCard';
import { CreateDonationModal } from '@/components/donations/CreateDonationModal';
import {
  UtensilsCrossed,
  Hourglass,
  CheckCircle2,
  Scale,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  History,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function OverviewPage() {
  const { stats, donations, activities, urgentDonations } = useDemoStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Active available donations for overview list
  const activeAvailable = donations
    .filter((d) => d.status === 'available')
    .slice(0, 4);

  // Recent activity stream (latest 5)
  const recentActivities = activities.slice(0, 5);

  const formatActivityTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Welcome Action */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#1b4332] rounded-2xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold border border-emerald-700/60">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hyderabad Campus Food Rescue Cluster</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Coordinating Surplus Food Pickups &amp; NGO Logistics
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Prioritizing perishable batches by pickup deadline and matching local student volunteers
            and NGOs to prevent avoidable food waste.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-emerald-950 hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-emerald-800" />
              <span>Create Surplus Donation</span>
            </button>
            <Link
              href="/queue"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-700/80 transition-colors"
            >
              <span>View Rescue Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (Derived from shared demo store) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Donations"
          value={stats.totalAvailableCount}
          subtext={`${stats.totalAvailableKg} kg awaiting volunteer pickup`}
          icon={<UtensilsCrossed className="w-5 h-5" />}
          accent="forest"
          badge={`${stats.totalAvailableKg} kg`}
        />
        <StatCard
          label="Urgent Deadlines"
          value={stats.urgentCount}
          subtext="Requires pickup within 2 hours"
          icon={<Hourglass className="w-5 h-5" />}
          accent="amber"
          badge={stats.urgentCount > 0 ? 'Action Needed' : 'Nominal'}
        />
        <StatCard
          label="Completed Pickups"
          value={stats.completedPickups}
          subtext={`${stats.completionRatePercent}% completion rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="blue"
          badge="Verified"
        />
        <StatCard
          label="Total Rescued"
          value={`${stats.totalKgRescued} kg`}
          subtext={`~${stats.estimatedMealsServed} wholesome meals served`}
          icon={<Scale className="w-5 h-5" />}
          accent="forest"
          badge={`${stats.co2PreventedKg} kg CO2e`}
        />
      </div>

      {/* Main Grid: Rescue Queue Snapshot & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Donations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Active Food Donations</h3>
              <p className="text-xs text-stone-500">
                Surplus food lots ready for matching and scheduled pickup
              </p>
            </div>
            <Link
              href="/donations"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>View All ({donations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeAvailable.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeAvailable.map((donation) => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-900 text-sm">All donations claimed!</p>
              <p className="text-xs text-stone-500 mt-1">
                There are no open surplus donations right now. Create one below to test.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Donation</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Urgency Overview & Activity Feed */}
        <div className="space-y-6">
          {/* Urgency Overview Box */}
          <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Urgency Overview</h3>
              <Link
                href="/queue"
                className="text-[11px] font-semibold text-emerald-800 hover:underline"
              >
                Queue Details
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">Urgent Priority</p>
                    <p className="text-[10px] text-amber-800/80">&lt; 2h until safe pickup window closes</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-900 text-base">
                  {urgentDonations.length}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-900">Normal Priority</p>
                    <p className="text-[10px] text-emerald-800/80">&gt; 2h buffer for routine pickup</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-900 text-base">
                  {donations.filter((d) => d.status === 'available' && evaluateUrgency(d).level === 'normal').length}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-stone-500" />
                <span>Recent Platform Activity</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">Live Demo Log</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-emerald-700/60 pl-3 py-0.5 space-y-0.5">
                  <div className="flex items-center justify-between text-stone-500 text-[10px]">
                    <span className="font-semibold text-stone-800">{act.actor}</span>
                    <span>{formatActivityTime(act.timestamp)}</span>
                  </div>
                  <p className="text-stone-700 line-clamp-2 text-[11px] leading-relaxed">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateDonationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

export default OverviewPage;
