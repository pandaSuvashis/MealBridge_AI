'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { LogOut, Menu, Moon, Sparkles, Sun } from 'lucide-react';

interface TopNavProps {
  onOpenMobile: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  authEmail: string | null;
  onSignOut: () => void;
}

export function TopNav({ onOpenMobile, isDarkMode, onToggleTheme, authEmail, onSignOut }: TopNavProps) {
  const pathname = usePathname();

  // Page titles and context descriptions
  const getHeaderMeta = () => {
    switch (pathname) {
      case '/':
        return {
          title: 'Rescue Operations Overview',
          subtitle: 'Real-time surplus food coordination across Hyderabad campus node',
        };
      case '/donations':
        return {
          title: 'Food Donations Inventory',
          subtitle: 'Active surplus listings, categories, and pickup readiness',
        };
      case '/donations/create':
        return {
          title: 'Add Food',
          subtitle: 'Register freshly prepared or untouched surplus food batch',
        };
      case '/queue':
        return {
          title: 'Urgency-Based Rescue Queue',
          subtitle: 'Algorithmically ranked by pickup deadline & spoilage risk',
        };
      case '/matching':
        return {
          title: 'Call Donors',
          subtitle: 'Contact food donors directly to arrange collection',
        };
      case '/pickup':
        return {
          title: 'Pickup Lifecycle & Verification',
          subtitle: 'Secure handoff workflow: Available → Claimed → Collected → Delivered',
        };
      case '/analytics':
        return {
          title: 'Impact & Sustainability Analytics',
          subtitle: 'Verified rescued kilograms, CO2e prevented, and meal equivalents',
        };
      default:
        return {
          title: 'MealBridge AI',
          subtitle: 'Surplus Food Rescue Platform',
        };
    }
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <header className="h-16 bg-white border-b border-stone-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-2.5 h-2.5" />
              Live State
            </span>
          </div>
          <p className="text-[11px] text-stone-500 hidden sm:block leading-tight">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
          className="theme-toggle group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 transition-all duration-300 hover:scale-105 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="relative grid h-5 w-5 place-items-center" aria-hidden="true">
            <Sun
              size={19}
              strokeWidth={1.8}
              className={`absolute transition-all duration-300 motion-reduce:transition-none ${
                isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
              }`}
            />
            <Moon
              size={19}
              strokeWidth={1.8}
              className={`absolute transition-all duration-300 motion-reduce:transition-none ${
                isDarkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
          </span>
        </button>
        <div className="hidden max-w-44 truncate text-xs text-stone-500 xl:block" title={authEmail ?? undefined}>
          {authEmail}
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 sm:px-3"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden text-xs font-semibold sm:inline">Sign out</span>
        </button>
        {/* Interactive Notifications */}
        <NotificationDropdown />

      </div>
    </header>
  );
}
