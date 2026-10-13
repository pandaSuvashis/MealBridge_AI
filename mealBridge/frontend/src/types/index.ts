export type FoodCategory =
  | 'Prepared Meals'
  | 'Bakery & Bread'
  | 'Packaged Goods'
  | 'Fresh Produce'
  | 'Dairy & Beverages';

export type DonationStatus =
  | 'available'
  | 'claimed'
  | 'collected'
  | 'delivered'
  | 'expired';

export type UrgencyLevel = 'urgent' | 'normal' | 'expired';

export interface Donation {
  id: string;
  foodName: string;
  category: FoodCategory;
  quantityKg: number;
  donorName: string;
  donorPhone?: string;
  donorType: 'Campus Mess' | 'Cafeteria' | 'Bakery' | 'Tech Park Dining' | 'Event Hall';
  pickupLocation: string;
  locationArea: string; // e.g. "Gachibowli", "IIIT Campus", "DLF"
  preparationTime: string; // ISO string
  pickupDeadline: string; // ISO string
  foodNotes: string;
  analyticsIncluded: boolean;
  status: DonationStatus;
  pickupCode?: string; // 6-digit verification code generated when claimed
  claimedBy?: {
    id: string;
    name: string;
    type: RecipientType;
    claimedAt: string;
  };
  collectedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export type RecipientType = 'NGO' | 'Community Shelter' | 'Student Volunteer' | 'Feeding Center';

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  area: string; // e.g. "Gachibowli"
  distanceKm: number;
  vehicleType: 'E-Bike / Cargo' | 'Van / Mini-Truck' | 'Bicycle with Bag' | 'Auto-Rickshaw';
  collectionCapacityKg: number;
  operatingHours: string;
  contactPerson: string;
  contactPhone: string;
  activeStatus: 'Available' | 'On Route' | 'Off Duty';
  reliabilityScore: number; // 1-100
}

export interface MatchRecommendation {
  recipient: Recipient;
  matchScore: number; // 0-100
  matchCategory: 'Optimal Match' | 'Good Match' | 'Alternative Match';
  feasibility: 'High' | 'Medium' | 'Low';
  reasons: string[];
  capacityFitPercent: number;
  estimatedTransitMinutes: number;
}

export interface UrgencyEvaluation {
  level: UrgencyLevel;
  remainingMinutes: number;
  formattedRemaining: string;
  urgencyScore: number; // 0 - 100 (higher = more urgent)
  explanation: string;
  isExpired: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'created' | 'claimed' | 'collected' | 'delivered' | 'expired';
  donationId: string;
  foodName: string;
  quantityKg: number;
  actor: string;
  description: string;
}

export interface ImpactStats {
  totalAvailableKg: number;
  totalAvailableCount: number;
  urgentCount: number;
  completedPickups: number;
  totalKgRescued: number;
  estimatedMealsServed: number; // ~2.5 meals per kg
  co2PreventedKg: number; // ~2.1 kg CO2e per kg food saved
  recipientsServedCount: number;
  completionRatePercent: number;
}

export type UserRole = {
  id: string;
  name: string;
  roleType: 'Donor' | 'NGO' | 'Volunteer' | 'Admin';
  organization: string;
  avatarInitials: string;
};
