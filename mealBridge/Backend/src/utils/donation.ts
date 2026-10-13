import type { DonationStatus } from '../types/domain.js';

export const isExpired = (deadline: Date, now = new Date()): boolean => deadline.getTime() <= now.getTime();

export const canTransition = (from: DonationStatus, to: DonationStatus): boolean =>
  (from === 'available' && to === 'claimed') ||
  (from === 'claimed' && to === 'collected') ||
  (from === 'collected' && to === 'delivered');
