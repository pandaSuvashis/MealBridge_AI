export type ImpactDonation = {
  analyticsIncluded: boolean;
  status: string;
  quantityKg: number;
  collectorId?: string | null;
  pickupDeadline?: Date;
};

export function calculateImpact(donations: ImpactDonation[], now = new Date()) {
  const tracked = donations.filter((donation) => donation.analyticsIncluded);
  const delivered = tracked.filter((donation) => donation.status === 'delivered');
  const expired = tracked.filter((donation) => donation.status === 'expired');
  const available = tracked.filter((donation) => donation.status === 'available');
  const totalKgRescued = delivered.reduce((sum, donation) => sum + donation.quantityKg, 0);
  const totalAvailableKg = available.reduce((sum, donation) => sum + donation.quantityKg, 0);
  const urgentCount = available.filter((donation) => donation.pickupDeadline && donation.pickupDeadline > now && donation.pickupDeadline <= new Date(now.getTime() + 2 * 60 * 60 * 1000)).length;
  const completedPickups = delivered.length;
  return {
    totalAvailableKg,
    totalAvailableCount: available.length,
    urgentCount,
    completedPickups,
    totalKgRescued,
    estimatedMealsServed: Math.round(totalKgRescued * 2.5),
    co2PreventedKg: Number((totalKgRescued * 2.1).toFixed(1)),
    recipientsServedCount: new Set(delivered.map((donation) => donation.collectorId).filter(Boolean)).size,
    completionRatePercent: completedPickups + expired.length ? Math.round((completedPickups / (completedPickups + expired.length)) * 100) : 0,
  };
}
