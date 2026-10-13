'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Hourglass,
  PhoneCall,
  QrCode,
  BarChart3,
  Leaf,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { urgentDonations } = useMealBridgeStore();

  const urgentCount = urgentDonations.length;

  const navItems = [
    {
      name: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Food',
      href: '/donations',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      name: 'Urgent Food',
      href: '/queue',
      icon: Hourglass,
      badge: urgentCount > 0 ? `${urgentCount} urgent` : null,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      name: 'Call Donors',
      href: '/matching',
      icon: PhoneCall,
      badge: null,
    },
    {
      name: 'Pickup & Delivery',
      href: '/pickup',
      icon: QrCode,
      badge: null,
    },
    {
      name: 'Impact',
      href: '/analytics',
      icon: BarChart3,
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

      <div className="p-4 border-t border-stone-100 bg-stone-50/60">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>College Campus Node</span>
          <span className="font-mono text-[10px]">v0.9-mvp</span>
        </div>
      </div>
    </aside>
  );
}
