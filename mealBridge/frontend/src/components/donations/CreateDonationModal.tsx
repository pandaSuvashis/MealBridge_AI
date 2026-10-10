'use client';

import React, { useState, useEffect } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { FoodCategory } from '@/types';
import { Plus, X, CheckCircle, AlertCircle, Utensils } from 'lucide-react';

interface CreateDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateDonationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDonationModalProps) {
  const { createDonation, currentRole } = useDemoStore();

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Prepared Meals');
  const [quantityKg, setQuantityKg] = useState('');
  const [donorName, setDonorName] = useState(
    currentRole.roleType === 'Donor' ? currentRole.organization : 'IIIT Bakul Central Mess'
  );
  const [donorType, setDonorType] = useState<
    'Campus Mess' | 'Cafeteria' | 'Bakery' | 'Tech Park Dining' | 'Event Hall'
  >('Campus Mess');
  const [pickupLocation, setPickupLocation] = useState(
    'Ground Floor Dispatch Dock, Bakul Nivas, IIIT Hyderabad Campus'
  );
  const [locationArea, setLocationArea] = useState('IIIT Campus');
  const [preparationTime, setPreparationTime] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [foodNotes, setFoodNotes] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize dates in useEffect on modal open so prerendering isn't blocked
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const toIsoLocal = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}`;

      const prep = new Date(now.getTime() - 30 * 60 * 1000);
      const deadline = new Date(now.getTime() + 120 * 60 * 1000);
      setPreparationTime(toIsoLocal(prep));
      setPickupDeadline(toIsoLocal(deadline));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!foodName.trim()) {
      newErrors.foodName = 'Food name or description is required';
    }

    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantityKg = 'Quantity must be a positive number greater than 0 kg';
    } else if (qty > 500) {
      newErrors.quantityKg = 'Quantity seems unusually large. Please enter ≤ 500 kg';
    }

    if (!donorName.trim()) {
      newErrors.donorName = 'Donor or organization name is required';
    }

    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = 'Specific pickup address/dock is required';
    }

    if (!preparationTime) {
      newErrors.preparationTime = 'Preparation time is required';
    }

    if (!pickupDeadline) {
      newErrors.pickupDeadline = 'Pickup deadline is required';
    } else if (preparationTime) {
      const prepTs = new Date(preparationTime).getTime();
      const deadTs = new Date(pickupDeadline).getTime();
      if (deadTs <= prepTs) {
        newErrors.pickupDeadline = 'Pickup deadline must be later than preparation time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const created = createDonation({
        foodName: foodName.trim(),
        category,
        quantityKg: parseFloat(quantityKg),
        donorName: donorName.trim(),
        donorType,
        pickupLocation: pickupLocation.trim(),
        locationArea: locationArea.trim() || 'Hyderabad Campus',
        preparationTime: new Date(preparationTime).toISOString(),
        pickupDeadline: new Date(pickupDeadline).toISOString(),
        foodNotes: foodNotes.trim(),
      });

      setSuccessMessage(
        `Successfully logged ${created.quantityKg} kg of "${created.foodName}" in the active rescue queue!`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess(created.id);
      }, 1400);
    } catch (err) {
      console.error(err);
      setErrors({ form: 'An unexpected error occurred while saving the donation.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800 text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base sm:text-lg">
                Create Surplus Food Donation
              </h2>
              <p className="text-xs text-stone-500">
                Register untouched surplus meals for nearby NGO or student volunteer rescue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="m-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs font-semibold">{successMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errors.form && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Row 1: Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Food Item Name / Description <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Vegetable Biryani, Paneer Curry & Phulkas"
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.foodName ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.foodName && (
                <p className="text-[11px] text-rose-600">{errors.foodName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Food Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              >
                <option value="Prepared Meals">Prepared Meals (Hot)</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Packaged Goods">Packaged Goods</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy & Beverages">Dairy & Beverages</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity & Donor Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Quantity (in kg) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                placeholder="e.g. 25"
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.quantityKg ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.quantityKg && (
                <p className="text-[11px] text-rose-600">{errors.quantityKg}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Donor Entity Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. IIIT Bakul Central Mess"
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.donorName ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.donorName && (
                <p className="text-[11px] text-rose-600">{errors.donorName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">Donor Facility Type</label>
              <select
                value={donorType}
                onChange={(e) =>
                  setDonorType(
                    e.target.value as
                      | 'Campus Mess'
                      | 'Cafeteria'
                      | 'Bakery'
                      | 'Tech Park Dining'
                      | 'Event Hall'
                  )
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              >
                <option value="Campus Mess">Campus Mess</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Bakery">Bakery</option>
                <option value="Tech Park Dining">Tech Park Dining</option>
                <option value="Event Hall">Event Hall / Banquet</option>
              </select>
            </div>
          </div>

          {/* Row 3: Pickup Location & Campus Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Specific Pickup Dock / Entrance <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Rear Loading Bay, Bakul Mess Kitchen"
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.pickupLocation ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.pickupLocation && (
                <p className="text-[11px] text-rose-600">{errors.pickupLocation}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">Campus / Area Cluster</label>
              <input
                type="text"
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                placeholder="e.g. IIIT Campus / Gachibowli"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>
          </div>

          {/* Row 4: Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800">
                Preparation Time <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.preparationTime ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.preparationTime && (
                <p className="text-[11px] text-rose-600">{errors.preparationTime}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center justify-between">
                <span>
                  Pickup Deadline <span className="text-rose-600">*</span>
                </span>
                <span className="text-[10px] text-amber-700 font-medium">Safe Food Window</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                  errors.pickupDeadline ? 'border-rose-400' : 'border-stone-300'
                }`}
              />
              {errors.pickupDeadline && (
                <p className="text-[11px] text-rose-600">{errors.pickupDeadline}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800">
              Food Safety & Handling Notes (Packaging, temperature, allergen warnings)
            </label>
            <textarea
              rows={2}
              value={foodNotes}
              onChange={(e) => setFoodNotes(e.target.value)}
              placeholder="e.g. Packed in 2 sealed stainless steel containers. Vegetarian food only. Keep upright during transport."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish to Rescue Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
