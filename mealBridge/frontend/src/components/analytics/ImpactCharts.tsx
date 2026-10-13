'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Donation } from '@/types';

interface ImpactChartsProps {
  donations: Donation[];
  currentTime: number;
}

export function ImpactCharts({ donations, currentTime }: ImpactChartsProps) {
  const deliveredDonations = donations.filter((d) => d.status === 'delivered');
  const indiaDateKey = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  };
  const todayKey = indiaDateKey(new Date(currentTime));
  const kgByDate = new Map<string, number>();
  for (const donation of deliveredDonations) {
    if (!donation.deliveredAt) continue;
    const dateKey = indiaDateKey(new Date(donation.deliveredAt));
    kgByDate.set(dateKey, (kgByDate.get(dateKey) ?? 0) + donation.quantityKg);
  }

  const timeSeriesData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${todayKey}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 6 + index);
    const dateKey = date.toISOString().slice(0, 10);
    return {
      day: new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      kgRescued: kgByDate.get(dateKey) ?? 0,
    };
  });
  const weeklyTotalKg = timeSeriesData.reduce((total, day) => total + day.kgRescued, 0);

  // 2. Status Distribution Data
  const statusCounts = donations.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusPieData = [
    { name: 'Delivered', value: statusCounts.delivered || 0, color: '#1b4332' },
    { name: 'Available', value: statusCounts.available || 0, color: '#40916c' },
    { name: 'Claimed', value: statusCounts.claimed || 0, color: '#3b82f6' },
    { name: 'Collected', value: statusCounts.collected || 0, color: '#8b5cf6' },
    { name: 'Expired', value: statusCounts.expired || 0, color: '#a8a29e' },
  ].filter((item) => item.value > 0);

  // 3. Category Breakdown (kg rescued per food category)
  const categoryMap = donations.reduce(
    (acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + d.quantityKg;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryBarData = Object.entries(categoryMap).map(([category, kg]) => ({
    category: category.replace(' & ', ' / '),
    kg,
  }));

  return (
    <div className="space-y-6">
      {/* Chart Row 1: Over-time Area Chart & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rescued Food Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Food Rescued by Day (kg)
              </h3>
              <p className="text-xs text-stone-500">
                Actual delivered donations from the last 7 days
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {weeklyTotalKg} kg this week
            </span>
          </div>

          {weeklyTotalKg > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} />
                  <YAxis unit=" kg" tick={{ fontSize: 11, fill: '#78716c' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e7e5e4',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(val: number | string | readonly (number | string)[] | undefined) => [
                      `${val} kg`,
                      'Food rescued',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="kgRescued"
                    stroke="#1b4332"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forestGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 flex items-center justify-center text-sm text-stone-500">
              No deliveries recorded in the last 7 days.
            </div>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              Donation Lifecycle Status
            </h3>
            <p className="text-xs text-stone-500">            Current tracked donations</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e7e5e4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: number | string | readonly (number | string)[] | undefined) => [
                    `${val} listings`,
                    'Count',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-stone-600 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-stone-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Category Breakdown Bar Chart */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              Food Donations by Category (kg)
            </h3>
            <p className="text-xs text-stone-500">
              Distribution across hot cooked meals, bakery, dairy and fresh produce
            </p>
          </div>
        </div>

        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#78716c' }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e7e5e4',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val: number | string | readonly (number | string)[] | undefined) => [
                  `${val} kg`,
                  'Total Weight',
                ]}
              />
              <Bar dataKey="kg" fill="#2d6a4f" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
