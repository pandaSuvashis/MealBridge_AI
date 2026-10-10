'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { DEMO_ROLES } from '@/lib/demo-data';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  UserCheck,
  Building,
  Shield,
  Bike,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

export default function SettingsDemoControlsPage() {
  const {
    donations,
    recipients,
    activities,
    currentRole,
    switchRole,
    resetDemoData,
    createDonation,
  } = useDemoStore();

  const [notification, setNotification] = useState<string | null>(null);
  const [jsonExpanded, setJsonExpanded] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset all demo state to original campus seed records?')) {
      resetDemoData();
      showNotification('Demo data successfully reset to initial state!');
    }
  };

  // Preset Scenario Injections
  const handleInjectUrgentBanquet = () => {
    const now = new Date();
    createDonation({
      foodName: 'Simulated Banquet Surplus: Biryani & Shahi Paneer (Urgent)',
      category: 'Prepared Meals',
      quantityKg: 35,
      donorName: 'HITEC City Tech Park Food Court',
      donorType: 'Tech Park Dining',
      pickupLocation: 'Gate 4 Banquet Loading Bay, HITEC City',
      locationArea: 'HITEC City',
      preparationTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(now.getTime() + 40 * 60 * 1000).toISOString(), // 40 mins left
      foodNotes: '35 kg freshly prepared corporate event surplus. Requires urgent pickup before night security lockout.',
    });
    showNotification('Injected 35 kg urgent banquet surplus into the Rescue Queue!');
  };

  const handleInjectBakerySurplus = () => {
    const now = new Date();
    createDonation({
      foodName: 'Simulated Midnight Bakery Surplus: Bagels & Muffin Trays',
      category: 'Bakery & Bread',
      quantityKg: 14,
      donorName: 'DLF French Patisserie & Deli',
      donorType: 'Bakery',
      pickupLocation: 'Store 12, DLF Food Court, Gachibowli',
      locationArea: 'DLF Food Street',
      preparationTime: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(now.getTime() + 180 * 60 * 1000).toISOString(), // 3 hours
      foodNotes: 'Sealed paper cartons. Dry storage, easy bicycle cargo transport.',
    });
    showNotification('Injected 14 kg bakery surplus into active donations!');
  };

  // Export JSON State
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify({ donations, recipients, activities, role: currentRole }, null, 2)
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mealbridge-demo-state-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-800" />
              <span>Demo Environment Controls</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Simulate edge-case operational scenarios, switch active demo personas, and reset local state
            </p>
          </div>
          <div className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>DEMO MODE ACTIVE</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: Personas & Quick Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Active Demo Persona */}
        <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-800" />
              <span>Active Persona Switcher</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Switch roles to view the application through different user perspectives
            </p>
          </div>

          <div className="space-y-2">
            {DEMO_ROLES.map((role) => {
              const isSelected = role.id === currentRole.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    switchRole(role.id);
                    showNotification(`Switched persona to: ${role.name} (${role.roleType})`);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-700">
                      {role.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{role.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-stone-100 text-stone-600">
                          {role.roleType}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{role.organization}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Preset Demo Scenarios */}
        <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Simulate Hackathon Scenarios</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Quickly inject realistic food rescue events to showcase system dynamics
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-stone-900">
                  Scenario A: Impending Expiry Banquet
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  Urgent 40m Window
                </span>
              </div>
              <p className="text-[11px] text-stone-600">
                Adds a 35 kg hot meal donation from HITEC City with a 40-minute pickup deadline.
                Triggers urgency alerts and elevates to top of Rescue Queue.
              </p>
              <button
                onClick={handleInjectUrgentBanquet}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Scenario A</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-stone-900">
                  Scenario B: Evening Bakery Run
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Normal 3h Window
                </span>
              </div>
              <p className="text-[11px] text-stone-600">
                Adds 14 kg of bread &amp; pastries from DLF Food Court suitable for cargo bike volunteers.
              </p>
              <button
                onClick={handleInjectBakerySurplus}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Scenario B</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* State Reset & Backup Management */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-800" />
              <span>State Persistence &amp; Reset</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Current state is stored in your browser&apos;s localStorage ({donations.length} donations, {activities.length} activities logged)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export State (JSON)</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>

        {/* State Inspector Toggle */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={() => setJsonExpanded(!jsonExpanded)}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <span>{jsonExpanded ? 'Hide Raw JSON State' : 'Inspect Raw JSON State'}</span>
          </button>

          {jsonExpanded && (
            <pre className="mt-3 p-4 rounded-xl bg-stone-900 text-stone-100 text-[11px] font-mono max-h-72 overflow-y-auto">
              {JSON.stringify({ donations, currentRole, activitiesCount: activities.length }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
