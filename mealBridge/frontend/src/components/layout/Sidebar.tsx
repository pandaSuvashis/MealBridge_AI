'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Hourglass,
  Users2,
  QrCode,
  BarChart3,
  Sliders,
  Leaf,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { urgentDonations, resetDemoData } = useDemoStore();

  const urgentCount = urgentDonations.length;

  const navItems = [
    {
      name: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Food Donations',
      href: '/donations',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      name: 'Rescue Queue',
      href: '/queue',
      icon: Hourglass,
      badge: urgentCount > 0 ? `${urgentCount} urgent` : null,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      name: 'Recipient Matching',
      href: '/matching',
      icon: Users2,
      badge: null,
    },
    {
      name: 'Pickup Verification',
      href: '/pickup',
      icon: QrCode,
      badge: null,
    },
    {
      name: 'Impact Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Demo Controls',
      href: '/settings',
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200/90 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-100 flex items-center justify-between">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Leaf className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-stone-900">
                MealBridge
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">Surplus Food Rescue</p>
          </div>
        </Link>
      </div>

      {/* Demo Mode Sub-banner */}
      <div className="mx-4 mt-3 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-900">DEMO MODE</span>
        </div>
        <span className="text-[10px] text-emerald-700/80 font-mono">HYD-CAMPUS</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-200' : 'text-stone-500'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-700 text-emerald-100 border-emerald-600'
                      : item.badgeColor || 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Quick Reset & Context */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>College Campus Node</span>
          <span className="font-mono text-[10px]">v0.9-mvp</span>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all demo records back to initial seeded campus data?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
}
