import type { MatchCandidate, RecipientType } from '../types/domain.js';

export type MatchResult = {
  recipient: MatchCandidate;
  matchScore: number;
  matchCategory: 'Optimal Match' | 'Good Match' | 'Alternative Match';
  feasibility: 'High' | 'Medium' | 'Low';
  reasons: string[];
  capacityFitPercent: number;
  estimatedTransitMinutes: number | null;
};

export function calculateMatches(quantityKg: number, candidates: MatchCandidate[]): MatchResult[] {
  return candidates
    .filter((candidate) => (candidate.collectionCapacityKg ?? 0) >= quantityKg)
    .map((recipient) => {
      const reasons: string[] = [];
      const capacity = recipient.collectionCapacityKg ?? 0;
      const capacityFitPercent = Math.round((quantityKg / capacity) * 100);
      let score = 35;
      reasons.push(`Capacity match: ${capacity} kg capacity covers this ${quantityKg} kg donation.`);

      const distance = recipient.distanceKm;
      let transit: number | null = null;
      if (typeof distance === 'number') {
        transit = Math.max(5, Math.round(distance * 3.5 + 3));
        if (distance <= 1.5) { score += 35; reasons.push(`Hyper-local: ${distance} km away (~${transit} min transit).`); }
        else if (distance <= 3) { score += 26; reasons.push(`Close proximity: ${distance} km away (~${transit} min transit).`); }
        else if (distance <= 5) { score += 16; reasons.push(`Moderate distance: ${distance} km away (~${transit} min transit).`); }
        else { score += 8; reasons.push(`Extended range: ${distance} km away (~${transit} min transit).`); }
      } else {
        score += 12;
        reasons.push('Distance is unavailable; pickup timing must be confirmed manually.');
      }

      if (recipient.activeStatus === 'Available') { score += 20; reasons.push('Currently available for dispatch.'); }
      else if (recipient.activeStatus === 'On Route') { score += 11; reasons.push('Already on route; dispatch confirmation needed.'); }
      else { score += 3; reasons.push('Currently off duty; dispatch confirmation needed.'); }

      const reliability = recipient.reliabilityScore ?? 80;
      score += Math.round(reliability / 10);
      reasons.push(`Reliability score: ${reliability}/100.`);
      score = Math.min(100, score);
      const feasibility: MatchResult['feasibility'] = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
      const matchCategory: MatchResult['matchCategory'] = score >= 85 ? 'Optimal Match' : score >= 65 ? 'Good Match' : 'Alternative Match';
      return { recipient, matchScore: score, matchCategory, feasibility, reasons, capacityFitPercent, estimatedTransitMinutes: transit };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export const recipientTypeForRole = (role: string, existing?: RecipientType): RecipientType =>
  existing ?? (role === 'volunteer' ? 'Student Volunteer' : 'NGO');
