'use client';

import React, { useState, useMemo } from 'react';
import { useMealBridgeStore } from '@/lib/mealbridge-store';
import { DonationStatus, FoodCategory, UrgencyLevel } from '@/types';
import { evaluateUrgency } from '@/lib/urgency';
import { DonationCard } from '@/components/donations/DonationCard';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { CreateDonationModal } from '@/components/donations/CreateDonationModal';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  UtensilsCrossed,
  RotateCcw,
} from 'lucide-react';

export default function DonationsPage() {
  const { donations, currentTime } = useMealBridgeStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = donation.foodName.toLowerCase().includes(query);
        const matchesDonor = donation.donorName.toLowerCase().includes(query);
        const matchesArea = donation.locationArea.toLowerCase().includes(query);
        const matchesLocation = donation.pickupLocation.toLowerCase().includes(query);
        if (!matchesName && !matchesDonor && !matchesArea && !matchesLocation) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && donation.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && donation.category !== categoryFilter) {
        return false;
      }

      // Urgency
      if (urgencyFilter !== 'all') {
        const evaluation = evaluateUrgency(donation, currentTime);
        if (evaluation.level !== urgencyFilter) {
          return false;
        }
      }

      return true;
    });
  }, [donations, currentTime, searchQuery, statusFilter, urgencyFilter, categoryFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    urgencyFilter !== 'all' ||
    categoryFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Food Donations Management</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage surplus food listings, view deadlines, and trigger volunteer pickups
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food item, donor name, mess hall, or location..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center self-end md:self-auto gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-medium ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Show cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Show table"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Statuses ({donations.length})</option>
            <option value="available">Available</option>
            <option value="claimed">Claimed</option>
            <option value="collected">Collected</option>
            <option value="delivered">Delivered</option>
            <option value="expired">Expired</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Urgency</option>
            <option value="urgent">Urgent (&lt; 2h)</option>
            <option value="normal">Normal (&gt; 2h)</option>
            <option value="expired">Expired</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Prepared Meals">Prepared Meals</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Packaged Goods">Packaged Goods</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Dairy & Beverages">Dairy & Beverages</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2 py-1 rounded-md text-[11px] font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}

          <div className="ml-auto text-xs text-stone-500">
            Showing <strong>{filteredDonations.length}</strong> of {donations.length} items
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {filteredDonations.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDonations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <DonationsTable donations={filteredDonations} />
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No donations match your filters</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your search query or filters, or create a new surplus donation.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900"
            >
              Add Food
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateDonationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
