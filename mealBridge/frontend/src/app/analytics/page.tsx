'use client';

import React from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { StatCard } from '@/components/ui/StatCard';
import { ImpactCharts } from '@/components/analytics/ImpactCharts';
import {
  Scale,
  CheckCircle2,
  Users2,
  Percent,
  Leaf,
  Utensils,
  Building,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function ImpactAnalyticsPage() {
  const { stats, donations } = useDemoStore();

  // Completed delivered missions list
  const completedMissions = donations.filter((d) => d.status === 'delivered');

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-800" />
              <span>Campus Sustainability &amp; Impact Analytics</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified metrics calculated from completed surplus food deliveries across Hyderabad institutions
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Real-time Aggregation
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
          subtext="100% verified handoff audit"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Recipients Served"
          value={stats.recipientsServedCount}
          subtext="NGOs, shelters, community kitchens"
          icon={<Users2 className="w-5 h-5" />}
          accent="forest"
          badge="Active Partners"
        />
        <StatCard
          label="Rescue Success Rate"
          value={`${stats.completionRatePercent}%`}
          subtext="Delivered vs expired listings"
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
              Calculated using the standard Indian food safety multiplier of 2.5 wholesome portions per kg.
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
              Avoided methane emissions by diverting biodegradable organic surplus from municipal landfills.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <ImpactCharts donations={donations} />

      {/* Completed Rescue Missions Log Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Completed Rescue Missions Log</h3>
            <p className="text-xs text-stone-500">
              Verified handoffs contributing to the platform&apos;s rescued food totals
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {completedMissions.length} Missions Logged
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
                <th className="py-3 px-3 text-right">Handoff Pass</th>
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
