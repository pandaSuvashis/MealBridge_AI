import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { Donation } from '../models/Donation.js';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { calculateMatches, recipientTypeForRole } from '../services/matching.service.js';
import { serializeDonation, serializeRecipient } from '../services/serializer.service.js';
import { AppError } from '../utils/AppError.js';
import { generatePickupCode, hashPickupCode, matchesPickupCode } from '../utils/pickupCode.js';
import { processDonationExpiry } from '../services/donation-expiry.service.js';

const ensureId = (id: string | string[]): string => {
  if (typeof id !== 'string') throw new AppError(400, 'INVALID_ID', 'The provided donation ID is invalid.');
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, 'INVALID_ID', 'The provided donation ID is invalid.');
  return id;
};

function requireAuthUser(req: Request) {
  if (!req.authUser) throw new AppError(401, 'AUTH_REQUIRED', 'Sign in to access this resource.');
  return req.authUser;
}

async function getDonorProfile(req: Request) {
  const authUser = requireAuthUser(req);
  const metadataName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name;
  const name = typeof metadataName === 'string' && metadataName.trim()
    ? metadataName.trim()
    : authUser.email?.split('@')[0] || 'MealBridge donor';
  const profile = await User.findOneAndUpdate(
    { supabaseUserId: authUser.id },
    { $setOnInsert: { name, role: 'donor' } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  if (profile.role !== 'donor') {
    throw new AppError(403, 'DONOR_ACCOUNT_REQUIRED', 'Only the linked donor account can create or edit this donation.');
  }
  return profile;
}

async function getLinkedCollector(req: Request) {
  const authUser = requireAuthUser(req);
  const collector = await User.findOne({
    supabaseUserId: authUser.id,
    role: { $in: ['ngo', 'volunteer'] },
  });
  if (!collector) {
    throw new AppError(403, 'COLLECTOR_ACCOUNT_REQUIRED', 'This action requires a linked NGO or volunteer profile.');
  }
  return collector;
}

export async function listDonations(req: Request, res: Response) {
  await processDonationExpiry();
  const filter: Record<string, unknown> = {};
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  if (status && status !== 'all') {
    if (!['available', 'claimed', 'collected', 'delivered', 'expired'].includes(status)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid donation status filter.');
    filter.status = status;
  }
  const urgency = typeof req.query.urgency === 'string' ? req.query.urgency : undefined;
  if (urgency === 'urgent') {
    filter.status = 'available';
    filter.pickupDeadline = { $gt: new Date(), $lte: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  } else if (urgency && !['normal', 'expired', 'all'].includes(urgency)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid urgency filter.');
  } else if (urgency === 'normal') {
    filter.status = 'available';
    filter.pickupDeadline = { $gt: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  } else if (urgency === 'expired') filter.status = 'expired';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (search) filter.$text = { $search: search };
  const donations = await Donation.find(filter).sort({ pickupDeadline: 1, createdAt: -1 });
  res.json({ success: true, data: donations.map(serializeDonation) });
}

export async function getDonation(req: Request, res: Response) {
  await processDonationExpiry();
  const donation = await Donation.findById(ensureId(req.params.id));
  if (!donation) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
  res.json({ success: true, data: serializeDonation(donation) });
}

export async function createDonation(req: Request, res: Response) {
  const input = req.body as Record<string, any>;
  const donor = await getDonorProfile(req);
  const donation = await Donation.create({
    ...input,
    donor: donor._id,
    preparationTime: new Date(input.preparationTime),
    pickupDeadline: new Date(input.pickupDeadline),
    analyticsIncluded: true,
    status: 'available',
  });
  res.status(201).json({ success: true, data: serializeDonation(donation) });
}

export async function updateDonation(req: Request, res: Response) {
  const id = ensureId(req.params.id);
  const input = req.body as Record<string, any>;
  const donor = await getDonorProfile(req);
  delete input.donor;
  for (const key of ['preparationTime', 'pickupDeadline']) if (input[key]) input[key] = new Date(input[key]);
  const donation = await Donation.findOneAndUpdate({ _id: id, donor: donor._id, status: 'available' }, input, { new: true, runValidators: true });
  if (!donation) {
    const existing = await Donation.findById(id).select('donor');
    if (!existing) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
    if (existing.donor?.toString() !== donor._id.toString()) {
      throw new AppError(403, 'DONATION_NOT_OWNED', 'You can only edit donations created by your account.');
    }
    throw new AppError(409, 'DONATION_LOCKED', 'Only available donations can be edited. Lifecycle status changes use dedicated endpoints.');
  }
  res.json({ success: true, data: serializeDonation(donation) });
}

export async function getMatches(req: Request, res: Response) {
  await processDonationExpiry();
  const donation = await Donation.findById(ensureId(req.params.id));
  if (!donation) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
  if (donation.status !== 'available') throw new AppError(409, 'DONATION_NOT_AVAILABLE', 'Only available donations can be matched.');
  const collectors = await User.find({ role: { $in: ['ngo', 'volunteer'] }, activeStatus: { $ne: 'Off Duty' } });
  const candidates = collectors.map((user) => ({
    id: user._id.toString(), name: user.name, type: recipientTypeForRole(user.role, user.recipientType as any), area: user.location ?? undefined,
    distanceKm: user.distanceKm ?? undefined, collectionCapacityKg: user.collectionCapacityKg ?? undefined, vehicleType: user.vehicleType ?? undefined,
    activeStatus: user.activeStatus as any, reliabilityScore: user.reliabilityScore ?? undefined,
  }));
  res.json({ success: true, data: calculateMatches(donation.quantityKg, candidates) });
}

export async function claimDonation(req: Request, res: Response) {
  const donationId = ensureId(req.params.id);
  const body = req.body as { collectorId?: string; recipientId?: string };
  const collector = await getLinkedCollector(req);
  const requestedCollector = body.collectorId ?? body.recipientId;
  if (requestedCollector && requestedCollector !== collector._id.toString()) {
    throw new AppError(403, 'COLLECTOR_ID_MISMATCH', 'A claim can only be made for your linked collector profile.');
  }
  if (collector.activeStatus === 'Off Duty') throw new AppError(403, 'COLLECTOR_OFF_DUTY', 'Your collector profile is currently off duty.');

  const preflight = await Donation.findById(donationId).select('quantityKg');
  if (!preflight) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
  if ((collector.collectionCapacityKg ?? 0) < preflight.quantityKg) throw new AppError(409, 'INSUFFICIENT_CAPACITY', 'The selected collector lacks sufficient collection capacity.');

  const pickupCode = generatePickupCode();
  const pickupCodeHash = hashPickupCode(pickupCode);
  const claimedAt = new Date();
  // This conditional update is the concurrency guard: exactly one caller can change available to claimed.
  const donation = await Donation.findOneAndUpdate(
    { _id: donationId, status: 'available', pickupDeadline: { $gt: claimedAt } },
    { $set: { status: 'claimed', pickupCodeHash, claimedBy: { collector: collector._id, name: collector.name, type: recipientTypeForRole(collector.role, collector.recipientType as any), claimedAt } } },
    { new: true },
  );
  if (!donation) {
    const exists = await Donation.exists({ _id: donationId });
    if (!exists) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
    throw new AppError(409, 'DONATION_UNAVAILABLE', 'This donation was already claimed or has expired.');
  }
  await Assignment.create({ donation: donation._id, collector: collector._id, pickupCodeHash, assignedAt: claimedAt, status: 'claimed' });
  res.status(201).json({ success: true, data: { donation: serializeDonation(donation), pickupCode } });
}

export async function verifyPickup(req: Request, res: Response) {
  const id = ensureId(req.params.id);
  const collector = await getLinkedCollector(req);
  const { pickupCode } = req.body as { pickupCode: string };
  const existing = await Donation.findById(id).select('+pickupCodeHash');
  if (!existing) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
  if (existing.status !== 'claimed') throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Only claimed donations can be verified for pickup.');
  if (existing.claimedBy?.collector?.toString() !== collector._id.toString()) {
    throw new AppError(403, 'PICKUP_NOT_ASSIGNED', 'Only the assigned collector can verify this pickup.');
  }
  if (!existing.pickupCodeHash || !matchesPickupCode(pickupCode, existing.pickupCodeHash)) throw new AppError(400, 'INVALID_PICKUP_CODE', 'The pickup verification code is invalid.');
  const verifiedAt = new Date();
  const donation = await Donation.findOneAndUpdate({ _id: id, status: 'claimed' }, { $set: { status: 'collected', collectedAt: verifiedAt } }, { new: true });
  if (!donation) throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'This pickup was already verified.');
  await Assignment.updateOne({ donation: id, status: 'claimed' }, { $set: { status: 'collected', verifiedAt } });
  res.json({ success: true, data: serializeDonation(donation) });
}

export async function completeDonation(req: Request, res: Response) {
  const id = ensureId(req.params.id);
  const collector = await getLinkedCollector(req);
  const existing = await Donation.findById(id).select('claimedBy.collector');
  if (!existing) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
  if (existing.claimedBy?.collector?.toString() !== collector._id.toString()) {
    throw new AppError(403, 'PICKUP_NOT_ASSIGNED', 'Only the assigned collector can complete this delivery.');
  }
  const completedAt = new Date();
  const donation = await Donation.findOneAndUpdate({ _id: id, status: 'collected' }, { $set: { status: 'delivered', deliveredAt: completedAt } }, { new: true });
  if (!donation) {
    const exists = await Donation.exists({ _id: id });
    if (!exists) throw new AppError(404, 'DONATION_NOT_FOUND', 'Donation not found.');
    throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Only collected donations can be completed.');
  }
  await Assignment.updateOne({ donation: id, status: 'collected' }, { $set: { status: 'delivered', completedAt } });
  res.json({ success: true, data: serializeDonation(donation) });
}
