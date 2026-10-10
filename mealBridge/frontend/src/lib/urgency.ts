import { Donation, UrgencyEvaluation, UrgencyLevel } from '@/types';

// Deterministic reference time for SSR prerendering
const PRERENDER_REFERENCE_TIME = new Date('2026-10-10T13:00:00.000Z').getTime();

/**
 * Transparent demo urgency evaluation function.
 * Evaluates food donations based on perishable nature, preparation time,
 * and minutes remaining until pickup deadline.
 */
export function evaluateUrgency(
  donation: Donation,
  currentTime?: Date | number
): UrgencyEvaluation {
  const deadline = new Date(donation.pickupDeadline).getTime();
  const now = currentTime
    ? typeof currentTime === 'number'
      ? currentTime
      : currentTime.getTime()
    : PRERENDER_REFERENCE_TIME;

  const diffMs = deadline - now;
  const remainingMinutes = Math.round(diffMs / (1000 * 60));

  if (remainingMinutes <= 0 || donation.status === 'expired') {
    const expiredMinutesAgo = Math.abs(remainingMinutes);
    const timeAgoStr =
      expiredMinutesAgo < 60
        ? `${expiredMinutesAgo} min ago`
        : `${Math.floor(expiredMinutesAgo / 60)}h ${expiredMinutesAgo % 60}m ago`;

    return {
      level: 'expired',
      remainingMinutes,
      formattedRemaining: `Expired (${timeAgoStr})`,
      urgencyScore: 0,
      explanation: 'Food safety pickup window has lapsed. Listing cannot be claimed for human consumption.',
      isExpired: true,
    };
  }

  // Format remaining time nicely
  let formattedRemaining = '';
  if (remainingMinutes < 60) {
    formattedRemaining = `${remainingMinutes}m remaining`;
  } else {
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    formattedRemaining = mins > 0 ? `${hours}h ${mins}m remaining` : `${hours}h remaining`;
  }

  // Urgent threshold is 120 minutes (2 hours)
  const isPreparedHotMeal = donation.category === 'Prepared Meals';
  const isUrgent = remainingMinutes <= 120 || (isPreparedHotMeal && remainingMinutes <= 150);

  if (isUrgent) {
    const clampedMinutes = Math.max(1, Math.min(120, remainingMinutes));
    const urgencyScore = Math.round(100 - (clampedMinutes / 120) * 30);

    const explanation = isPreparedHotMeal
      ? `Critical: Perishable hot meal requires pickup within ${formattedRemaining} to prevent temperature degradation.`
      : `High Priority: Pickup deadline is in ${formattedRemaining}. Timely dispatch required before donor closes.`;

    return {
      level: 'urgent',
      remainingMinutes,
      formattedRemaining,
      urgencyScore,
      explanation,
      isExpired: false,
    };
  }

  // Normal urgency (> 2 hours remaining)
  const urgencyScore = Math.max(10, Math.round(65 - (remainingMinutes / 360) * 40));
  const explanation = `Standard Window: ${formattedRemaining} buffer. Ample time for regular volunteer batching or NGO pickup.`;

  return {
    level: 'normal',
    remainingMinutes,
    formattedRemaining,
    urgencyScore,
    explanation,
    isExpired: false,
  };
}

/**
 * Sorts donations according to the urgency-first queue priority:
 * 1. Active urgent donations first (highest urgency score to lowest)
 * 2. Active normal donations next (soonest deadline first)
 * 3. Already claimed/collected donations
 * 4. Expired donations last
 */
export function sortDonationsByUrgency(
  donations: Donation[],
  currentTime?: Date | number
): { donation: Donation; evaluation: UrgencyEvaluation }[] {
  const evaluated = donations.map((donation) => ({
    donation,
    evaluation: evaluateUrgency(donation, currentTime),
  }));

  return evaluated.sort((a, b) => {
    const statusWeight = (item: typeof a) => {
      if (item.evaluation.isExpired || item.donation.status === 'expired') return 0;
      if (item.donation.status === 'delivered') return 1;
      if (item.donation.status === 'collected') return 2;
      if (item.donation.status === 'claimed') return 3;
      return item.evaluation.level === 'urgent' ? 5 : 4;
    };

    const weightDiff = statusWeight(b) - statusWeight(a);
    if (weightDiff !== 0) return weightDiff;

    if (a.evaluation.level === 'urgent' && b.evaluation.level === 'urgent') {
      return b.evaluation.urgencyScore - a.evaluation.urgencyScore;
    }

    if (a.evaluation.remainingMinutes > 0 && b.evaluation.remainingMinutes > 0) {
      return a.evaluation.remainingMinutes - b.evaluation.remainingMinutes;
    }

    return new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime();
  });
}
