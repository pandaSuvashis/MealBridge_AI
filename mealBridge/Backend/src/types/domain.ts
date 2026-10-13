export const donationStatuses = ['available', 'claimed', 'collected', 'delivered', 'expired'] as const;
export type DonationStatus = (typeof donationStatuses)[number];

export const foodCategories = ['Prepared Meals', 'Bakery & Bread', 'Packaged Goods', 'Fresh Produce', 'Dairy & Beverages'] as const;
export type FoodCategory = (typeof foodCategories)[number];

export const recipientTypes = ['NGO', 'Community Shelter', 'Student Volunteer', 'Feeding Center'] as const;
export type RecipientType = (typeof recipientTypes)[number];

export type MatchCandidate = {
  id: string;
  name: string;
  type: RecipientType;
  area?: string;
  distanceKm?: number;
  collectionCapacityKg?: number;
  vehicleType?: string;
  activeStatus?: 'Available' | 'On Route' | 'Off Duty';
  reliabilityScore?: number;
};
