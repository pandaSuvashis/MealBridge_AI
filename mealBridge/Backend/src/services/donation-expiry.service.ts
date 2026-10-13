import { Donation } from '../models/Donation.js';

export const EXPIRED_DONATION_RETENTION_MS = 5 * 60 * 1000;

/**
 * Available donations expire at their pickup deadline. Expired records are retained
 * briefly so the queue can communicate why they disappeared, then deleted.
 */
export async function processDonationExpiry(now = new Date()) {
  const deletionCutoff = new Date(now.getTime() - EXPIRED_DONATION_RETENTION_MS);
  const expired = await Donation.updateMany(
    { status: 'available', pickupDeadline: { $lte: now } },
    { $set: { status: 'expired' } },
  );
  const deleted = await Donation.deleteMany({
    status: 'expired',
    pickupDeadline: { $lte: deletionCutoff },
  });
  return { expiredCount: expired.modifiedCount, deletedCount: deleted.deletedCount };
}
