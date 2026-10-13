import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

export function generatePickupCode(): string {
  return `MB-${randomInt(1000, 10000)}`;
}

export function hashPickupCode(code: string): string {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function matchesPickupCode(input: string, hash: string): boolean {
  const candidate = Buffer.from(hashPickupCode(input), 'hex');
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
