import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatches } from '../src/services/matching.service.js';
import { canTransition, isExpired } from '../src/utils/donation.js';
import { generatePickupCode, hashPickupCode, matchesPickupCode } from '../src/utils/pickupCode.js';
import { donationInputSchema } from '../src/validators/donation.js';
import { calculateImpact } from '../src/services/impact.service.js';
import { EXPIRED_DONATION_RETENTION_MS } from '../src/services/donation-expiry.service.js';

test('expired donations are retained for five minutes before cleanup', () => {
  assert.equal(EXPIRED_DONATION_RETENTION_MS, 5 * 60 * 1000);
});

test('deadline handling treats now and past deadlines as expired', () => {
  const now = new Date('2026-10-10T12:00:00.000Z');
  assert.equal(isExpired(new Date('2026-10-10T12:00:00.000Z'), now), true);
  assert.equal(isExpired(new Date('2026-10-10T12:00:01.000Z'), now), false);
});

test('matching excludes insufficient capacity and ranks the nearest ready candidate', () => {
  const results = calculateMatches(20, [
    { id: 'small', name: 'Small', type: 'NGO', collectionCapacityKg: 10, distanceKm: 0.5, activeStatus: 'Available', reliabilityScore: 99 },
    { id: 'far', name: 'Far', type: 'NGO', collectionCapacityKg: 30, distanceKm: 5, activeStatus: 'Available', reliabilityScore: 90 },
    { id: 'near', name: 'Near', type: 'Student Volunteer', collectionCapacityKg: 25, distanceKm: 1, activeStatus: 'Available', reliabilityScore: 90 },
  ]);
  assert.deepEqual(results.map((result) => result.recipient.id), ['near', 'far']);
  assert.equal(results[0].feasibility, 'High');
});

test('pickup codes are backend-safe hashes and only the matching code verifies', () => {
  const code = generatePickupCode();
  const hash = hashPickupCode(code);
  assert.match(code, /^MB-\d{4}$/);
  assert.notEqual(hash, code);
  assert.equal(matchesPickupCode(code, hash), true);
  assert.equal(matchesPickupCode('MB-0000', hash), false);
});

test('donation lifecycle permits only claim, collection, and delivery in order', () => {
  assert.equal(canTransition('available', 'claimed'), true);
  assert.equal(canTransition('claimed', 'collected'), true);
  assert.equal(canTransition('collected', 'delivered'), true);
  assert.equal(canTransition('available', 'delivered'), false);
  assert.equal(canTransition('delivered', 'collected'), false);
});

test('donation validation rejects expired deadlines and accepts future deadlines', () => {
  const now = Date.now();
  const validDonation = {
    foodName: 'Rice', category: 'Prepared Meals', quantityKg: 12, donorName: 'Campus Mess', donorPhone: '+919876543210', donorType: 'Campus Mess',
    pickupLocation: 'Gate 1', locationArea: 'Campus', preparationTime: new Date(now - 30 * 60_000).toISOString(),
    pickupDeadline: new Date(now + 60_000).toISOString(), foodNotes: '',
  };

  assert.equal(donationInputSchema.safeParse(validDonation).success, true);
  assert.equal(donationInputSchema.safeParse({ ...validDonation, donorPhone: '9876543210' }).success, false);
  assert.equal(donationInputSchema.safeParse({ ...validDonation, donorPhone: '+919876543210' }).success, true);
  const expiredResult = donationInputSchema.safeParse({
    ...validDonation,
    pickupDeadline: new Date(now - 60_000).toISOString(),
  });
  assert.equal(expiredResult.success, false);
  if (!expiredResult.success) {
    assert.ok(expiredResult.error.issues.some((issue) => issue.path[0] === 'pickupDeadline'));
  }

  const invalidQuantityResult = donationInputSchema.safeParse({ ...validDonation, quantityKg: 0 });
  assert.equal(invalidQuantityResult.success, false);
});

test('impact excludes donations that have not been delivered', () => {
  const impact = calculateImpact([
    { analyticsIncluded: true, status: 'delivered', quantityKg: 12, collectorId: 'ngo-1' },
    { analyticsIncluded: true, status: 'collected', quantityKg: 50, collectorId: 'ngo-2' },
    { analyticsIncluded: true, status: 'expired', quantityKg: 9 },
    { analyticsIncluded: false, status: 'delivered', quantityKg: 100, collectorId: 'demo-ngo' },
  ]);
  assert.equal(impact.totalKgRescued, 12);
  assert.equal(impact.completedPickups, 1);
  assert.equal(impact.recipientsServedCount, 1);
});
