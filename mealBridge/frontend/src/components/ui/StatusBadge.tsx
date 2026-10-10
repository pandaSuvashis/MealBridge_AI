import React from 'react';
import { DonationStatus } from '@/types';
import { CheckCircle2, Clock, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs: Record<
    DonationStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    claimed: {
      label: 'Claimed (In Prep)',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />,
    },
    collected: {
      label: 'Collected (In Transit)',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: <PackageCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />,
    },
    delivered: {
      label: 'Delivered (Rescued)',
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />,
    },
    expired: {
      label: 'Expired',
      bg: 'bg-stone-100',
      text: 'text-stone-600',
      border: 'border-stone-300',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-stone-500" />,
    },
  };

  const config = configs[status] || configs.available;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${paddingClass}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
