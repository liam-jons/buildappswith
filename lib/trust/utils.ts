/**
 * Trust Domain - Utility Functions
 * 
 * This file contains utility functions for the trust architecture:
 * - Helper functions for tier calculation
 * - Formatting functions for trust indicators
 * - Validation utilities
 */

import { ValidationTier, TrustEvidence, ValidationTierInfo } from "./types";

/**
 * Calculate validation tier based on evidence
 * 
 * @param evidence Array of trust evidence items
 * @param requirements Tier requirements for comparison
 * @returns The appropriate validation tier
 */
export function calculateValidationTier(
  evidence: TrustEvidence[],
  requirements: Record<ValidationTier, ValidationTierInfo>
): ValidationTier {
  // Simple implementation - to be enhanced
  if (!evidence || evidence.length === 0) {
    return "basic";
  }
  
  // Count evidence by type
  const evidenceCounts = evidence.reduce((counts, item) => {
    counts[item.evidenceType] = (counts[item.evidenceType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Check expert tier requirements
  const expertReqs = requirements.expert.requirements;
  const meetExpertReqs = expertReqs.every(req => 
    !req.required || (evidenceCounts[req.evidenceType] || 0) >= req.count
  );
  
  if (meetExpertReqs) {
    return "expert";
  }
  
  // Check verified tier requirements
  const verifiedReqs = requirements.verified.requirements;
  const meetVerifiedReqs = verifiedReqs.every(req => 
    !req.required || (evidenceCounts[req.evidenceType] || 0) >= req.count
  );
  
  if (meetVerifiedReqs) {
    return "verified";
  }
  
  // Default tier
  return "basic";
}

/**
 * Format validation tier for display
 * 
 * @param tier The validation tier
 * @returns Formatted display name
 */
export function formatValidationTier(tier: ValidationTier): string {
  switch (tier) {
    case "basic":
      return "Basic";
    case "verified":
      return "Verified";
    case "expert":
      return "Expert";
    default:
      return "Unknown";
  }
}

/**
 * Get tier color code
 * 
 * @param tier The validation tier
 * @returns Color code for the tier
 */
export function getTierColorCode(tier: ValidationTier): string {
  switch (tier) {
    case "basic":
      return "#6E7191"; // Gray
    case "verified":
      return "#3E7BFA"; // Blue
    case "expert":
      return "#FFB800"; // Gold
    default:
      return "#6E7191"; // Default gray
  }
}

/**
 * Calculate progress towards next tier
 * 
 * @param evidence Array of trust evidence items
 * @param currentTier Current validation tier
 * @param requirements Tier requirements for comparison
 * @returns Progress percentage (0-100)
 */
export function calculateTierProgress(
  evidence: TrustEvidence[],
  currentTier: ValidationTier,
  requirements: Record<ValidationTier, ValidationTierInfo>
): number {
  // Implementation to be enhanced
  
  // For basic tier, calculate progress towards verified
  if (currentTier === "basic") {
    // Simple implementation - to be enhanced
    return Math.min(100, (evidence.length / 3) * 100);
  }
  
  // For verified tier, calculate progress towards expert
  if (currentTier === "verified") {
    // Simple implementation - to be enhanced
    return Math.min(100, (evidence.length / 6) * 100);
  }
  
  // Expert is already the highest tier
  if (currentTier === "expert") {
    return 100;
  }
  
  return 0;
}
