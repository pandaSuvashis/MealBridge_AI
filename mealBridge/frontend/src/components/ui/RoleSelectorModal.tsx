'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { DEMO_ROLES } from '@/lib/demo-data';
import { UserCheck, Shield, Building, Bike, ChevronDown } from 'lucide-react';

export function RoleSelectorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentRole, switchRole } = useDemoStore();

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'Donor':
        return <Building className="w-4 h-4 text-emerald-700" />;
      case 'NGO':
        return <Shield className="w-4 h-4 text-blue-700" />;
      case 'Volunteer':
        return <Bike className="w-4 h-4 text-amber-700" />;
      default:
        return <UserCheck className="w-4 h-4 text-purple-700" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-stone-200/90 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all text-left group shadow-2xs"
        aria-label="Switch active demo persona"
      >
        <div className="w-7 h-7 rounded-md bg-emerald-800 text-white flex items-center justify-center font-mono text-xs font-bold tracking-tight">
          {currentRole.avatarInitials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-stone-900 leading-tight">
            {currentRole.name}
          </p>
          <p className="text-[10px] text-stone-500 leading-tight flex items-center gap-1">
            <span className="font-medium text-emerald-800">{currentRole.roleType}</span>
            <span>·</span>
            <span className="truncate max-w-[120px]">{currentRole.organization}</span>
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900 text-base">Select Demo Persona</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Experience MealBridge AI from different ecosystem stakeholders
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              {DEMO_ROLES.map((role) => {
                const isSelected = role.id === currentRole.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      switchRole(role.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                        {getRoleIcon(role.roleType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{role.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-stone-200/80 text-stone-700">
                            {role.roleType}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{role.organization}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
