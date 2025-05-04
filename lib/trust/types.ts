/**
 * Trust Domain - Type Definitions
 * 
 * This file contains TypeScript types for the trust architecture:
 * - Trust evidence structure
 * - Validation tier definitions
 * - Verification status types
 */

/**
 * Trust evidence types
 */
export type EvidenceType = "portfolio" | "certification" | "review" | "verification";

/**
 * Validation tier levels
 */
export type ValidationTier = "basic" | "verified" | "expert";

/**
 * Trust evidence structure
 */
export interface TrustEvidence {
  builderId: string;
  evidenceType: EvidenceType;
  title: string;
  description?: string;
  url?: string;
  attachmentId?: string;
  submissionDate: string;
}

/**
 * Validation tier requirement
 */
export interface TierRequirement {
  evidenceType: EvidenceType;
  count: number;
  required: boolean;
}

/**
 * Validation tier structure
 */
export interface ValidationTierInfo {
  tier: ValidationTier;
  requirements: TierRequirement[];
  verifiedDate?: string;
  lastUpdated: string;
}

/**
 * Trust validation result
 */
export interface TrustValidationResult {
  success: boolean;
  message: string;
  validationTier?: ValidationTier;
  validationErrors?: any[];
}

/**
 * Builder validation status
 */
export interface BuilderValidationStatus {
  builderId: string;
  tier: ValidationTier;
  evidenceCount: number;
  verifiedDate?: string;
  lastUpdated: string;
}
