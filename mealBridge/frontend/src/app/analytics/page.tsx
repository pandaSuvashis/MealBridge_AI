'use client';

import React from 'react';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import { StatCard } from '@/components/ui/StatCard';
import { ImpactCharts } from '@/components/analytics/ImpactCharts';
import { formatShortDateTime } from '@/lib/format';
import {
  Scale,
  CheckCircle2,
  Users2,
  Percent,
  Leaf,
  Utensils,
} from 'lucide-react';

export default function ImpactAnalyticsPage() {
  const { stats, donations, currentTime } = useMealBridgeStore();

  const analyticsDonations = donations.filter((donation) => donation.analyticsIncluded);
  const completedMissions = analyticsDonations.filter((donation) => donation.status === 'delivered');

  const formatDate = formatShortDateTime;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-800" />
              <span>Food Rescue Impact</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Shows new donations and deliveries recorded from today onward. Older records are kept but not included.
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            New Activity Only
          </span>
        </div>
      </div>

      {/* Impact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Food Rescued"
          value={`${stats.totalKgRescued} kg`}
          subtext="From verified delivered missions"
          icon={<Scale className="w-5 h-5" />}
          accent="forest"
          badge="Rescued"
        />
        <StatCard
          label="Completed Pickups"
          value={stats.completedPickups}
          subtext="Confirmed deliveries"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Recipients Served"
          value={stats.recipientsServedCount}
          subtext="Unique receivers"
          icon={<Users2 className="w-5 h-5" />}
          accent="forest"
          badge="Active Partners"
        />
        <StatCard
          label="Rescue Success Rate"
          value={`${stats.completionRatePercent}%`}
          subtext="Based on tracked donations"
          icon={<Percent className="w-5 h-5" />}
          accent="amber"
          badge="Efficiency"
        />
      </div>

      {/* Secondary Eco Impact Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-900 to-[#143621] text-white p-5 rounded-xl border border-emerald-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-800/80 border border-emerald-700 shrink-0">
            <Utensils className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <span className="text-xs text-emerald-200/90 font-medium uppercase tracking-wider">
              Nutritious Meals Provided
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight mt-0.5">
              ~{stats.estimatedMealsServed} Meals
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1">
              Estimate based on approximately 2.5 meals per kg rescued.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white p-5 rounded-xl border border-emerald-700 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-700/80 border border-emerald-600 shrink-0">
            <Leaf className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-xs text-emerald-200/90 font-medium uppercase tracking-wider">
              Greenhouse Gases Prevented
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight mt-0.5">
              {stats.co2PreventedKg} kg CO₂e
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1">
              Estimate based on approximately 2.1 kg CO₂e per kg rescued.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <ImpactCharts donations={analyticsDonations} currentTime={currentTime} />

      {/* Completed Rescue Missions Log Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Completed Rescue Missions Log</h3>
            <p className="text-xs text-stone-500">
              Deliveries counted in the platform&apos;s impact totals
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {completedMissions.length} deliveries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Rescued Item</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Donor Organization</th>
                <th className="py-3 px-3">Rescue Partner (NGO / Volunteer)</th>
                <th className="py-3 px-3">Completed At</th>
                <th className="py-3 px-3 text-right">Pickup Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {completedMissions.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-stone-900">{m.foodName}</span>
                    <span className="block text-[11px] text-stone-500">{m.category}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                    {m.quantityKg} kg
                  </td>
                  <td className="py-3 px-3 text-stone-700">
                    {m.donorName}
                    <span className="block text-[10px] text-stone-400">{m.locationArea}</span>
                  </td>
                  <td className="py-3 px-3 text-emerald-900 font-medium">
                    {m.claimedBy?.name || 'Authorized Partner'}
                    <span className="block text-[10px] text-stone-500">{m.claimedBy?.type}</span>
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {formatDate(m.deliveredAt || m.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-600 text-xs">
                    {m.pickupCode || 'MB-HIST'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
