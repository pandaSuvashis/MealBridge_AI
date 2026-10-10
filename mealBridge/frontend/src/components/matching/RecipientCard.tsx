'use client';

import React from 'react';
import { MatchRecommendation, Donation } from '@/types';
import {
  Shield,
  MapPin,
  Scale,
  Bike,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface RecipientCardProps {
  recommendation: MatchRecommendation;
  donation: Donation;
  onAssign: (recipientId: string) => void;
  isAssigned?: boolean;
}

export function RecipientCard({
  recommendation,
  donation,
  onAssign,
  isAssigned = false,
}: RecipientCardProps) {
  const { recipient, matchScore, matchCategory, feasibility, reasons, estimatedTransitMinutes } =
    recommendation;

  const getCategoryBadge = () => {
    switch (matchCategory) {
      case 'Optimal Match':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Good Match':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getFeasibilityBadge = () => {
    switch (feasibility) {
      case 'High':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-stone-600 bg-stone-100 border-stone-200';
    }
  };

  const isAvailable = donation.status === 'available';

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
        matchCategory === 'Optimal Match'
          ? 'border-emerald-300 ring-1 ring-emerald-200/60'
          : 'border-stone-200/90 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Header: Name, Score & Category */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-stone-900">{recipient.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {recipient.type}
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{recipient.area}</span>
              <span>·</span>
              <span className="font-medium text-stone-700">{recipient.distanceKm} km away</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="font-mono text-xl font-extrabold text-stone-900">
                {matchScore}%
              </span>
            </div>
            <span
              className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge()}`}
            >
              {matchCategory}
            </span>
          </div>
        </div>

        {/* Operational Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-stone-100 text-xs">
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400">Load Capacity</span>
            <p className="font-mono font-bold text-stone-800">{recipient.collectionCapacityKg} kg</p>
            <span className="text-[10px] text-stone-500">
              Needs {donation.quantityKg} kg ({Math.round((donation.quantityKg / recipient.collectionCapacityKg) * 100)}% load)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400">Transit Time</span>
            <p className="font-mono font-bold text-stone-800">~{estimatedTransitMinutes} mins</p>
            <span className="text-[10px] text-stone-500">Fast urban transit</span>
          </div>

          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400">Vehicle Type</span>
            <p className="font-medium text-stone-800 truncate">{recipient.vehicleType}</p>
            <span className="text-[10px] text-stone-500">Campus compatible</span>
          </div>

          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400">Feasibility</span>
            <div>
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[11px] font-bold border ${getFeasibilityBadge()}`}
              >
                {feasibility} Feasibility
              </span>
            </div>
            <span className="text-[10px] text-stone-500">{recipient.activeStatus}</span>
          </div>
        </div>

        {/* Explainable Reasons */}
        <div className="mt-3 space-y-1.5">
          <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wide">
            Recommendation Explanation
          </p>
          <ul className="space-y-1 text-xs text-stone-600">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="text-xs text-stone-500 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-stone-400" />
          <span>
            {recipient.contactPerson} ({recipient.contactPhone})
          </span>
        </div>

        {isAssigned ? (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Currently Assigned</span>
          </span>
        ) : isAvailable ? (
          <button
            onClick={() => onAssign(recipient.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs"
          >
            <span>Assign & Claim</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs text-stone-400 font-medium">Donation not in available state</span>
        )}
      </div>
    </div>
  );
}
