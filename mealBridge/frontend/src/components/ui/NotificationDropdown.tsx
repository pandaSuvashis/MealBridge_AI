'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/demo-store';
import { evaluateUrgency } from '@/lib/urgency';
import { Bell, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { urgentDonations, donations } = useDemoStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const urgentCount = urgentDonations.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {urgentCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-xs">
            {urgentCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-900">Rescue Alerts</span>
              {urgentCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  {urgentCount} Urgent
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                  All Clear
                </span>
              )}
            </div>
            <span className="text-xs text-stone-400">Live Demo Feed</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {urgentDonations.length > 0 ? (
              urgentDonations.map((donation) => {
                const urgency = evaluateUrgency(donation);
                return (
                  <div
                    key={donation.id}
                    className="p-3.5 hover:bg-amber-50/50 transition-colors group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {donation.foodName}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {donation.donorName} · {donation.quantityKg} kg
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center text-[11px] text-amber-800 font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            {urgency.formattedRemaining}
                          </span>
                          <span className="text-[11px] text-stone-400">·</span>
                          <span className="text-[11px] text-stone-500 truncate">
                            {donation.locationArea}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2 opacity-80" />
                <p className="text-xs font-medium text-stone-800">No urgent deadlines pending</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  All active surplus food has &gt;2h pickup windows.
                </p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between text-xs px-3">
            <span className="text-stone-500">Urgency threshold: &lt; 2h deadline</span>
            <Link
              href="/queue"
              onClick={() => setIsOpen(false)}
              className="font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              Open Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
