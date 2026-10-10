'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { RoleSelectorModal } from '@/components/ui/RoleSelectorModal';
import { Menu, Sparkles } from 'lucide-react';

interface TopNavProps {
  onOpenMobile: () => void;
}

export function TopNav({ onOpenMobile }: TopNavProps) {
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
          title: 'Create Surplus Donation',
          subtitle: 'Register freshly prepared or untouched surplus food batch',
        };
      case '/queue':
        return {
          title: 'Urgency-Based Rescue Queue',
          subtitle: 'Algorithmically ranked by pickup deadline & spoilage risk',
        };
      case '/matching':
        return {
          title: 'Transparent Recipient Matching',
          subtitle: 'Explainable capacity, proximity, and transit feasibility scoring',
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
      case '/settings':
        return {
          title: 'Demo Environment Controls',
          subtitle: 'Manage local simulation parameters, test state, and persona views',
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
          aria-label="Toggle mobile menu"
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
        {/* Interactive Notifications */}
        <NotificationDropdown />

        <div className="h-5 w-px bg-stone-200" />

        {/* Demo Role / Persona Switcher */}
        <RoleSelectorModal />
      </div>
    </header>
  );
}
