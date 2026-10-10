'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { Donation } from '@/types';
import {
  QrCode,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Eye,
  EyeOff,
  Sparkles,
  PackageCheck,
} from 'lucide-react';

interface VerificationPanelProps {
  donation: Donation;
  onSuccess?: () => void;
}

export function VerificationPanel({ donation, onSuccess }: VerificationPanelProps) {
  const { verifyPickupCode, markAsDelivered } = useDemoStore();
  const [codeInput, setCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDemoPass, setShowDemoPass] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!codeInput.trim()) {
      setErrorMsg('Please enter the 6-character pickup verification code.');
      return;
    }

    const result = verifyPickupCode(donation.id, codeInput.trim());
    if (result.success) {
      setSuccessMsg(
        `Pickup verified! Food transfer confirmed from ${donation.donorName}. Status updated to "Collected".`
      );
      setCodeInput('');
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(result.error || 'Verification failed. Please check the code.');
    }
  };

  const handleMarkDelivered = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = markAsDelivered(donation.id);
    if (result.success) {
      setSuccessMsg(
        `Mission accomplished! ${donation.quantityKg} kg has been successfully delivered and added to platform impact statistics.`
      );
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(result.error || 'Failed to update delivery status.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Stepper Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-stone-900 text-base">Pickup Lifecycle Flow</h3>
          <span className="text-xs text-stone-400 font-mono">ID: {donation.id}</span>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
          {/* Step 1: Available */}
          <div className="space-y-1">
            <div
              className={`h-2 rounded-full ${
                ['available', 'claimed', 'collected', 'delivered'].includes(donation.status)
                  ? 'bg-emerald-700'
                  : 'bg-stone-200'
              }`}
            />
            <span className="font-medium text-stone-700 text-[11px] block">1. Available</span>
          </div>

          {/* Step 2: Claimed */}
          <div className="space-y-1">
            <div
              className={`h-2 rounded-full ${
                ['claimed', 'collected', 'delivered'].includes(donation.status)
                  ? 'bg-emerald-700'
                  : 'bg-stone-200'
              }`}
            />
            <span className="font-medium text-stone-700 text-[11px] block">2. Claimed</span>
          </div>

          {/* Step 3: Collected */}
          <div className="space-y-1">
            <div
              className={`h-2 rounded-full ${
                ['collected', 'delivered'].includes(donation.status)
                  ? 'bg-emerald-700'
                  : 'bg-stone-200'
              }`}
            />
            <span className="font-medium text-stone-700 text-[11px] block">3. Collected</span>
          </div>

          {/* Step 4: Delivered */}
          <div className="space-y-1">
            <div
              className={`h-2 rounded-full ${
                donation.status === 'delivered' ? 'bg-emerald-700' : 'bg-stone-200'
              }`}
            />
            <span className="font-medium text-stone-700 text-[11px] block">4. Delivered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-semibold">Verification Error</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* State-specific UI */}
      {donation.status === 'claimed' && (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Enter Pickup Handover Code</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Presented by the authorized volunteer / NGO driver at the loading dock
              </p>
            </div>

            {/* Simulated Demo Helper Toggle */}
            <button
              type="button"
              onClick={() => setShowDemoPass(!showDemoPass)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200 transition-colors"
            >
              {showDemoPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showDemoPass ? 'Hide Collector Pass' : 'View Collector Pass (Demo Helper)'}</span>
            </button>
          </div>

          {/* Demo Pass Banner */}
          {showDemoPass && donation.pickupCode && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Simulated Authorized Collector Pass
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900">
                  DEMO PASS
                </span>
              </div>
              <p className="text-stone-600 text-[11px]">
                In a live deployment, this code is sent to the authorized volunteer&apos;s mobile app or SMS.
                Use code below to test verification:
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-stone-900 bg-white px-3 py-1 rounded border border-amber-200 tracking-wider">
                  {donation.pickupCode}
                </span>
                <button
                  type="button"
                  onClick={() => setCodeInput(donation.pickupCode || '')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                >
                  Quick Fill
                </button>
              </div>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. MB-7824"
                maxLength={8}
                className="w-full px-3.5 py-2.5 text-sm font-mono tracking-wider font-semibold rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Verify & Release Food</span>
            </button>
          </form>
        </div>
      )}

      {donation.status === 'collected' && (
        <div className="pt-2 border-t border-stone-100 space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-700" />
                Transit In Progress
              </span>
              <span className="text-[11px] text-purple-700 font-mono">
                Code verified: {donation.pickupCode}
              </span>
            </div>
            <p className="text-purple-800/90 mt-1">
              {donation.claimedBy?.name} is transporting {donation.quantityKg} kg of {donation.foodName} to beneficiaries.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleMarkDelivered}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Final Distribution (Mark Delivered)</span>
            </button>
          </div>
        </div>
      )}

      {donation.status === 'delivered' && (
        <div className="pt-2 border-t border-stone-100">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-sm">Rescue Mission Complete</p>
              <p className="mt-0.5">
                Successfully delivered by {donation.claimedBy?.name}. {donation.quantityKg} kg rescued (~
                {Math.round(donation.quantityKg * 2.5)} meals provided).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
