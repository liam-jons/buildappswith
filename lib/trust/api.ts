/**
 * Trust Domain - API Client Functions
 * 
 * This file contains client-side API functions for the trust architecture:
 * - Fetching validation tier information
 * - Submitting trust evidence
 * - Verification status checking
 */

import { TrustValidationResult, TrustEvidence } from "./types";

/**
 * Submit trust evidence for validation
 * 
 * @param evidence The trust evidence to submit
 * @returns Validation result
 */
export async function submitTrustEvidence(evidence: TrustEvidence): Promise<TrustValidationResult> {
  try {
    const response = await fetch("/api/trust/evidence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(evidence)
    });
    
    if (!response.ok) {
      throw new Error("Failed to submit trust evidence");
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    };
  }
}

/**
 * Get validation tier for a builder
 * 
 * @param builderId The builder's ID
 * @returns The validation tier information
 */
export async function getValidationTier(builderId: string): Promise<{
  tier: string;
  verifiedDate?: Date;
  evidenceCount: number;
}> {
  try {
    const response = await fetch(`/api/trust/validation-tier/${builderId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch validation tier");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching validation tier:", error);
    
    // Return default data
    return {
      tier: "basic",
      evidenceCount: 0
    };
  }
}
