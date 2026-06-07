/**
 * Cooperation Invariants System - Validators
 *
 * Validates commitment rule and locality condition.
 */

import type {
  InvariantDelta,
  CooperationAction,
  CommitmentResult,
  LocalityResult,
  ValidationResult
} from './types.js';

/**
 * Validate the commitment rule: ΔT≥0 ∧ ΔV≥0 ∧ ΔF≥0 ∧ ΔC≥0
 * "Do not reduce transparency, verifiability, freedom, or cooperation capacity."
 */
export function validateCommitment(delta: InvariantDelta): CommitmentResult {
  const violatedInvariants: ('T' | 'V' | 'F' | 'C')[] = [];

  if (delta.deltaT < 0) violatedInvariants.push('T');
  if (delta.deltaV < 0) violatedInvariants.push('V');
  if (delta.deltaF < 0) violatedInvariants.push('F');
  if (delta.deltaC < 0) violatedInvariants.push('C');

  const satisfied = violatedInvariants.length === 0;
  const recommendation = satisfied
    ? 'Action is cooperation-compliant: all invariants preserved or improved.'
    : `Reject action: violates ${violatedInvariants.join(', ')} invariants. Cooperation requires Δ≥0 for all invariants.`;

  return { satisfied, violatedInvariants, recommendation };
}

/**
 * Validate the locality condition: "Only claim what is locally observable."
 * Ensures actions are grounded in local, verifiable facts.
 */
export function validateLocality(action: CooperationAction): LocalityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check local context is specified
  if (!action.localContext || action.localContext.trim() === '') {
    errors.push('Missing local context identifier. Locality requires a specific context.');
  }

  // Check for observable facts
  if (!action.observableFacts || action.observableFacts.length === 0) {
    warnings.push('No observable facts provided. Action may not be verifiable by others.');
  }

  // Check for non-local claims (simple heuristic: claims about "everyone", "always", etc.)
  const nonLocalKeywords = ['everyone', 'always', 'never', 'universal', 'absolute', 'global'];
  const combinedText = `${action.type} ${action.localContext} ${(action.observableFacts ?? []).join(' ')}`;
  const foundNonLocalClaims = nonLocalKeywords.filter(kw =>
    combinedText.toLowerCase().includes(kw)
  );

  if (foundNonLocalClaims.length > 0) {
    errors.push(
      `Detected potentially non-local claims using: ${foundNonLocalClaims.join(', ')}. ` +
      'Locality condition requires claims to be about observable, specific contexts.'
    );
  }

  // Validate facts are non-empty
  if (action.observableFacts) {
    const emptyFacts = action.observableFacts.filter(f => !f || f.trim() === '');
    if (emptyFacts.length > 0) {
      warnings.push(`${emptyFacts.length} observable fact(s) are empty.`);
    }
  }

  const valid = errors.length === 0;
  const localityCompliant = valid;

  return { valid, errors, warnings, localityCompliant };
}

/**
 * Validate both commitment rule and locality condition
 */
export function validateAction(
  action: CooperationAction
): ValidationResult {
  const commitment = validateCommitment(action.estimatedImpact);
  const locality = validateLocality(action);

  const overallValid = commitment.satisfied && locality.valid;

  return { commitment, locality, overallValid };
}

/**
 * Check if invariant values are within valid range [0, 1]
 */
export function validateInvariantRange(
  transparency: number,
  verifiability: number,
  freedom: number,
  capacity: number
): boolean {
  const inRange = (v: number) => v >= 0 && v <= 1;
  return inRange(transparency) && inRange(verifiability) && inRange(freedom) && inRange(capacity);
}
