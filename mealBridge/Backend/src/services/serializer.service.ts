import type { DonationDocument } from '../models/Donation.js';

export function serializeDonation(donation: DonationDocument | Record<string, any>) {
  const value: any = typeof (donation as any).toObject === 'function' ? (donation as any).toObject() : donation;
  return {
    id: value._id.toString(),
    foodName: value.foodName,
    category: value.category,
    quantityKg: value.quantityKg,
    donorName: value.donorName,
    donorPhone: value.donorPhone ?? '',
    donorType: value.donorType,
    pickupLocation: value.pickupLocation,
    locationArea: value.locationArea,
    preparationTime: new Date(value.preparationTime).toISOString(),
    pickupDeadline: new Date(value.pickupDeadline).toISOString(),
    foodNotes: value.foodNotes ?? '',
    analyticsIncluded: value.analyticsIncluded === true,
    status: value.status,
    claimedBy: value.claimedBy ? {
      id: value.claimedBy.collector.toString(), name: value.claimedBy.name, type: value.claimedBy.type,
      claimedAt: new Date(value.claimedBy.claimedAt).toISOString(),
    } : undefined,
    collectedAt: value.collectedAt ? new Date(value.collectedAt).toISOString() : undefined,
    deliveredAt: value.deliveredAt ? new Date(value.deliveredAt).toISOString() : undefined,
    createdAt: new Date(value.createdAt).toISOString(),
    updatedAt: value.updatedAt ? new Date(value.updatedAt).toISOString() : undefined,
  };
}

export function serializeRecipient(user: any) {
  return {
    id: user._id.toString(), name: user.name, type: user.recipientType ?? (user.role === 'volunteer' ? 'Student Volunteer' : 'NGO'),
    area: user.location, distanceKm: user.distanceKm, vehicleType: user.vehicleType,
    collectionCapacityKg: user.collectionCapacityKg, operatingHours: user.operatingHours,
    contactPerson: user.contactPerson, contactPhone: user.contactPhone, activeStatus: user.activeStatus,
    reliabilityScore: user.reliabilityScore,
  };
}
