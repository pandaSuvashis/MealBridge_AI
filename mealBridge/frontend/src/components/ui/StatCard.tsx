import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accent?: 'forest' | 'amber' | 'blue' | 'neutral';
  badge?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  accent = 'forest',
  badge,
}: StatCardProps) {
  const accentStyles = {
    forest: {
      iconBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      borderHover: 'hover:border-emerald-300',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-800 border-amber-100',
      borderHover: 'hover:border-amber-300',
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-800 border-sky-100',
      borderHover: 'hover:border-sky-300',
    },
    neutral: {
      iconBg: 'bg-stone-100 text-stone-700 border-stone-200',
      borderHover: 'hover:border-stone-300',
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs transition-all duration-200 ${style.borderHover}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-mono">
              {value}
            </span>
            {badge && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${style.iconBg} shrink-0`}>
          {icon}
        </div>
      </div>
      {subtext && (
        <p className="mt-3 text-xs text-stone-500 flex items-center gap-1.5">
          {subtext}
        </p>
      )}
    </div>
  );
}
