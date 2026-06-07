/**
 * Cooperation Invariants System - Type Definitions
 *
 * Implements a contract over observable relations with invariants:
 * - T (transparency): How transparent is the cooperation
 * - V (verifiability): How verifiable are the claims
 * - F (freedom): How free is participation
 * - C (capacity): What's the cooperation capacity
 */

/**
 * Current state of cooperation invariants
 * All values are on a 0-1 scale
 */
export interface InvariantState {
  transparency: number;
  verifiability: number;
  freedom: number;
  capacity: number;
  timestamp: Date;
}

/**
 * Changes in invariants (ΔT, ΔV, ΔF, ΔC)
 * Positive values indicate improvement
 */
export interface InvariantDelta {
  deltaT: number;
  deltaV: number;
  deltaF: number;
  deltaC: number;
  /** Whether all deltas satisfy the commitment rule (Δ≥0) */
  satisfaction: 'all-positive' | 'partial' | 'violated';
}

/**
 * Action with estimated and actual invariant impacts
 */
export interface CooperationAction {
  id: string;
  type: string;
  actor: string;
  localContext: string;
  timestamp: Date;
  estimatedImpact: InvariantDelta;
  actualImpact?: InvariantDelta;
  outcome: 'success' | 'failure' | 'pending';
  /** Observable facts supporting locality of this action */
  observableFacts?: string[];
}

/**
 * Result of commitment rule validation
 * Rule: ΔT≥0 ∧ ΔV≥0 ∧ ΔF≥0 ∧ ΔC≥0
 */
export interface CommitmentResult {
  satisfied: boolean;
  violatedInvariants: ('T' | 'V' | 'F' | 'C')[];
  recommendation: string;
}

/**
 * Result of locality validation
 * Locality condition: Only claim what is locally observable
 */
export interface LocalityResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  localityCompliant: boolean;
}

/**
 * Combined validation result
 */
export interface ValidationResult {
  commitment: CommitmentResult;
  locality: LocalityResult;
  overallValid: boolean;
}

/**
 * Log entry format for JSONL storage
 */
export interface CooperationLogEntry {
  action: CooperationAction;
  validation: ValidationResult;
  stateBefore: InvariantState;
  stateAfter: InvariantState;
  loggedAt: Date;
}
