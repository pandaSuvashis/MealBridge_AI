import React from 'react';
import { UrgencyEvaluation } from '@/types';
import { AlertTriangle, Clock, Ban } from 'lucide-react';

interface UrgencyBadgeProps {
  evaluation: UrgencyEvaluation;
  showRemainingText?: boolean;
}

export function UrgencyBadge({ evaluation, showRemainingText = true }: UrgencyBadgeProps) {
  if (evaluation.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <Ban className="w-3.5 h-3.5 text-stone-500" />
        <span>Expired</span>
        {showRemainingText && <span className="text-stone-400 font-normal">({evaluation.formattedRemaining})</span>}
      </span>
    );
  }

  if (evaluation.level === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
        </span>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        <span>Urgent</span>
        {showRemainingText && (
          <span className="text-amber-800 font-normal">· {evaluation.formattedRemaining}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <Clock className="w-3.5 h-3.5 text-emerald-600" />
      <span>Normal</span>
      {showRemainingText && (
        <span className="text-emerald-700/80 font-normal">· {evaluation.formattedRemaining}</span>
      )}
    </span>
  );
}
