import type { Request, Response } from 'express';
import { Donation } from '../models/Donation.js';
import { serializeDonation } from '../services/serializer.service.js';
import { calculateImpact } from '../services/impact.service.js';
import { processDonationExpiry } from '../services/donation-expiry.service.js';

export async function getImpact(_req: Request, res: Response) {
  await processDonationExpiry();
  const donations = await Donation.find().select('analyticsIncluded status quantityKg pickupDeadline claimedBy.collector');
  res.json({ success: true, data: calculateImpact(donations.map((donation) => ({
    analyticsIncluded: donation.analyticsIncluded,
    status: donation.status,
    quantityKg: donation.quantityKg,
    pickupDeadline: donation.pickupDeadline,
    collectorId: donation.claimedBy?.collector?.toString(),
  }))) });
}

export async function getActivity(req: Request, res: Response) {
  const requestedLimit = Number(req.query.limit ?? 20);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100) : 20;
  const donations = await Donation.find({ analyticsIncluded: true, status: 'delivered' }).sort({ deliveredAt: -1 }).limit(limit);
  res.json({ success: true, data: donations.map(serializeDonation) });
}
