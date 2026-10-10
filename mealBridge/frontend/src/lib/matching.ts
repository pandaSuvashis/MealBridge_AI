import { Donation, Recipient, MatchRecommendation } from '@/types';

/**
 * Transparent demo recipient matching engine.
 * Computes an explainable match score (0-100) based on:
 * 1. Collection capacity vs donation quantity (35%)
 * 2. Proximity / distance in km (35%)
 * 3. Status readiness and operational reliability (20%)
 * 4. Urgency & vehicle suitability (10%)
 */
export function calculateMatchRecommendations(
  donation: Donation,
  recipients: Recipient[]
): MatchRecommendation[] {
  const quantity = donation.quantityKg;

  const recommendations: MatchRecommendation[] = recipients.map((recipient) => {
    const reasons: string[] = [];

    // 1. Capacity scoring (max 35)
    let capacityScore = 0;
    const capacityFitPercent = Math.round((quantity / recipient.collectionCapacityKg) * 100);

    if (recipient.collectionCapacityKg >= quantity) {
      // Comfortably fits
      const excessRatio = (recipient.collectionCapacityKg - quantity) / recipient.collectionCapacityKg;
      // Ideally between 20% and 100% capacity utilization
      capacityScore = 35;
      const spareKg = recipient.collectionCapacityKg - quantity;
      reasons.push(
        `Capacity match: ${recipient.collectionCapacityKg} kg max load handles this ${quantity} kg donation (${spareKg} kg margin).`
      );
    } else {
      // Undersized capacity
      const ratio = recipient.collectionCapacityKg / quantity;
      capacityScore = Math.round(ratio * 18);
      const shortage = quantity - recipient.collectionCapacityKg;
      reasons.push(
        `Partial load only: Capacity is ${recipient.collectionCapacityKg} kg (${shortage} kg deficit, requires split pickup).`
      );
    }

    // 2. Proximity scoring (max 35)
    let distanceScore = 0;
    // Estimate transit time: roughly 3-4 mins per km in Hyderabad traffic plus 3 min pickup buffer
    const estimatedTransitMinutes = Math.max(5, Math.round(recipient.distanceKm * 3.5 + 3));

    if (recipient.distanceKm <= 1.5) {
      distanceScore = 35;
      reasons.push(`Hyper-local: ${recipient.distanceKm} km away (~${estimatedTransitMinutes} min transit via campus perimeter).`);
    } else if (recipient.distanceKm <= 3.0) {
      distanceScore = 26;
      reasons.push(`Close proximity: ${recipient.distanceKm} km away (~${estimatedTransitMinutes} min transit).`);
    } else if (recipient.distanceKm <= 5.0) {
      distanceScore = 16;
      reasons.push(`Moderate distance: ${recipient.distanceKm} km away (~${estimatedTransitMinutes} min transit).`);
    } else {
      distanceScore = 8;
      reasons.push(`Extended range: ${recipient.distanceKm} km away (~${estimatedTransitMinutes} min transit).`);
    }

    // 3. Readiness & Reliability (max 20)
    let readinessScore = 0;
    if (recipient.activeStatus === 'Available') {
      readinessScore = 20;
      reasons.push(`Readiness: Currently active & on standby in ${recipient.area}.`);
    } else if (recipient.activeStatus === 'On Route') {
      readinessScore = 11;
      reasons.push(`Readiness: On active delivery run nearby; may combine routes.`);
    } else {
      readinessScore = 3;
      reasons.push(`Notice: Currently off duty; requires dispatch confirmation.`);
    }

    // 4. Vehicle suitability & urgency compatibility (max 10)
    let vehicleScore = 0;
    const isHeavy = quantity > 30;
    if (isHeavy) {
      if (recipient.vehicleType.includes('Van') || recipient.vehicleType.includes('Auto')) {
        vehicleScore = 10;
        reasons.push(`Vehicle fit: ${recipient.vehicleType} ideal for heavier bulk cargo.`);
      } else {
        vehicleScore = 4;
      }
    } else {
      // Light / moderate donation - cargo bikes and autos excel at swift urban navigation
      vehicleScore = 10;
      reasons.push(`Transit agility: ${recipient.vehicleType} enables fast turnaround through narrow access gates.`);
    }

    // Total score
    const totalScore = Math.min(100, Math.round(capacityScore + distanceScore + readinessScore + vehicleScore));

    // Feasibility calculation
    let feasibility: 'High' | 'Medium' | 'Low' = 'Low';
    if (totalScore >= 75 && recipient.collectionCapacityKg >= quantity && recipient.activeStatus === 'Available') {
      feasibility = 'High';
    } else if (totalScore >= 52) {
      feasibility = 'Medium';
    } else {
      feasibility = 'Low';
    }

    // Match category
    let matchCategory: 'Optimal Match' | 'Good Match' | 'Alternative Match' = 'Alternative Match';
    if (totalScore >= 78 && feasibility === 'High') {
      matchCategory = 'Optimal Match';
    } else if (totalScore >= 58) {
      matchCategory = 'Good Match';
    }

    return {
      recipient,
      matchScore: totalScore,
      matchCategory,
      feasibility,
      reasons,
      capacityFitPercent,
      estimatedTransitMinutes,
    };
  });

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
