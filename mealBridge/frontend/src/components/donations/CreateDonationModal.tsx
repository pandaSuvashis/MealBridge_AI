'use client';

import React, { useState } from 'react';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import { FoodCategory } from '@/types';
import { Plus, X, CheckCircle, AlertCircle, Utensils } from 'lucide-react';

const toLocalDateTime = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

function normalizeIndianPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (/^\+91\d{10}$/.test(trimmed)) return `+${digits}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  return null;
}

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
  if (!isOpen) return null;
  return <DonationForm onClose={onClose} onSuccess={onSuccess} />;
}

function DonationForm({
  onClose,
  onSuccess,
}: Pick<CreateDonationModalProps, 'onClose' | 'onSuccess'>) {
  const { createDonation } = useMealBridgeStore();

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Prepared Meals');
  const [quantityKg, setQuantityKg] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorType, setDonorType] = useState<
    'Campus Mess' | 'Cafeteria' | 'Bakery' | 'Tech Park Dining' | 'Event Hall'
  >('Campus Mess');
  const [pickupLocation, setPickupLocation] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [preparationTime, setPreparationTime] = useState(() =>
    toLocalDateTime(new Date(Date.now() - 30 * 60 * 1000))
  );
  const [pickupDeadline, setPickupDeadline] = useState(() =>
    toLocalDateTime(new Date(Date.now() + 120 * 60 * 1000))
  );
  const [foodNotes, setFoodNotes] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (foodName.trim().length < 2) {
      newErrors.foodName = 'Food name must contain at least 2 characters';
    }

    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantityKg = 'Quantity must be a positive number greater than 0 kg';
    } else if (qty > 500) {
      newErrors.quantityKg = 'Quantity seems unusually large. Please enter ≤ 500 kg';
    }

    if (donorName.trim().length < 2) {
      newErrors.donorName = 'Donor or organization name must contain at least 2 characters';
    }

    const normalizedPhone = normalizeIndianPhone(donorPhone);
    if (!normalizedPhone) {
      newErrors.donorPhone = 'Enter a valid 10-digit Indian phone number or include the country code.';
    }

    if (pickupLocation.trim().length < 3) {
      newErrors.pickupLocation = 'Specific pickup address/dock must contain at least 3 characters';
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
      } else if (deadTs <= Date.now()) {
        newErrors.pickupDeadline = 'Pickup deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedDonorPhone = normalizeIndianPhone(donorPhone);
    if (!validate()) return;
    if (!normalizedDonorPhone) return;

    try {
      const created = await createDonation({
        foodName: foodName.trim(),
        category,
        quantityKg: parseFloat(quantityKg),
        donorName: donorName.trim(),
        donorPhone: normalizedDonorPhone,
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
      setErrors({
        form: err instanceof Error ? err.message : 'An unexpected error occurred while saving the donation.',
      });
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
                Add Food Donation
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800" htmlFor="donor-phone">
              Donor Phone Number <span className="text-rose-600">*</span>
            </label>
            <input
              id="donor-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="e.g. 98765 43210"
              aria-describedby={errors.donorPhone ? 'donor-phone-error donor-phone-note' : 'donor-phone-note'}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${
                errors.donorPhone ? 'border-rose-400' : 'border-stone-300'
              }`}
            />
            {errors.donorPhone && <p id="donor-phone-error" className="text-[11px] text-rose-600">{errors.donorPhone}</p>}
            <p id="donor-phone-note" className="text-[11px] text-stone-500">
              Signed-in users can call this number to arrange food collection.
            </p>
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
                min={toLocalDateTime(new Date())}
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
              <span>Add Donation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
