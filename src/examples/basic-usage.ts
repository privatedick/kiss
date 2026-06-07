/**
 * Cooperation Invariants System - Basic Usage Example
 *
 * Demonstrates tracking cooperation invariants and validating
 * the commitment rule and locality condition.
 */

import { InvariantTracker } from '../core/InvariantTracker.js';
import {
  validateAction,
  validateCommitment,
  validateLocality
} from '../core/validators.js';
import type {
  CooperationAction,
  InvariantDelta
} from '../core/types.js';

/**
 * Create a cooperation action with invariant impacts
 */
function createAction(
  id: string,
  type: string,
  localContext: string,
  deltaT: number,
  deltaV: number,
  deltaF: number,
  deltaC: number,
  observableFacts?: string[]
): CooperationAction {
  const impact: InvariantDelta = {
    deltaT,
    deltaV,
    deltaF,
    deltaC,
    satisfaction: 'all-positive'
  };

  return {
    id,
    type,
    actor: 'system',
    localContext,
    timestamp: new Date(),
    estimatedImpact: impact,
    outcome: 'success',
    observableFacts
  };
}

/**
 * Print validation results
 */
function printValidation(action: CooperationAction): void {
  console.log(`\n=== Action: ${action.type} ===`);
  console.log(`Context: ${action.localContext}`);
  console.log(`Impact: ΔT=${action.estimatedImpact.deltaT}, ΔV=${action.estimatedImpact.deltaV}, ΔF=${action.estimatedImpact.deltaF}, ΔC=${action.estimatedImpact.deltaC}`);

  const validation = validateAction(action);

  console.log(`\nCommitment Rule:`);
  console.log(`  Satisfied: ${validation.commitment.satisfied}`);
  console.log(`  ${validation.commitment.recommendation}`);

  console.log(`\nLocality Condition:`);
  console.log(`  Valid: ${validation.locality.valid}`);
  if (validation.locality.errors.length > 0) {
    console.log(`  Errors: ${validation.locality.errors.join('; ')}`);
  }
  if (validation.locality.warnings.length > 0) {
    console.log(`  Warnings: ${validation.locality.warnings.join('; ')}`);
  }

  console.log(`\nOverall: ${validation.overallValid ? '✅ VALID' : '❌ INVALID'}`);
}

/**
 * Print current tracker state
 */
function printState(tracker: InvariantTracker): void {
  const state = tracker.getCurrentState();
  console.log('\n--- Current Invariant State ---');
  console.log(`Transparency (T):  ${state.transparency.toFixed(2)}`);
  console.log(`Verifiability (V): ${state.verifiability.toFixed(2)}`);
  console.log(`Freedom (F):      ${state.freedom.toFixed(2)}`);
  console.log(`Capacity (C):     ${state.capacity.toFixed(2)}`);
}

/**
 * Main demonstration
 */
async function main(): Promise<void> {
  console.log('=== Cooperation Invariants System - Basic Usage ===\n');

  // Initialize tracker
  const tracker = new InvariantTracker();
  printState(tracker);

  // Example 1: Valid cooperative action (all deltas positive)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const action1 = createAction(
    'action-1',
    'publish-open-source',
    'project-kiss',
    0.2,  // Increases transparency
    0.1,  // Increases verifiability
    0.0,  // Maintains freedom
    0.1,  // Increases capacity
    ['code-released-to-public', 'license-visible-to-all']
  );
  printValidation(action1);

  if (validateAction(action1).overallValid) {
    tracker.recordAction(action1);
  }
  printState(tracker);

  // Example 2: Valid action (maintains invariants)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const action2 = createAction(
    'action-2',
    'add-documentation',
    'project-kiss',
    0.1,  // Increases transparency
    0.0,  // Maintains verifiability
    0.0,  // Maintains freedom
    0.0,  // Maintains capacity
    ['readme-file-updated']
  );
  printValidation(action2);

  if (validateAction(action2).overallValid) {
    tracker.recordAction(action2);
  }
  printState(tracker);

  // Example 3: Invalid action (violates commitment rule - reduces freedom)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const action3 = createAction(
    'action-3',
    'restrict-participation',
    'project-kiss',
    -0.1, // Reduces transparency
    0.0,  // Maintains verifiability
    -0.2, // Reduces freedom
    0.1,  // Increases capacity
    ['access-control-added']
  );
  printValidation(action3);

  if (validateAction(action3).overallValid) {
    tracker.recordAction(action3);
  } else {
    console.log('\n⚠️  Action rejected due to invariant violations.');
  }
  printState(tracker);

  // Example 4: Invalid action (violates locality - no observable facts)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const action4 = createAction(
    'action-4',
    'claim-universal-truth',
    'abstract-concept',
    0.5,
    0.5,
    0.5,
    0.5,
    [] // No observable facts - locality violation
  );
  printValidation(action4);

  if (validateAction(action4).overallValid) {
    tracker.recordAction(action4);
  } else {
    console.log('\n⚠️  Action rejected due to locality violations.');
  }
  printState(tracker);

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('=== Summary ===');
  const history = tracker.getHistory();
  console.log(`Total actions recorded: ${history.length}`);
  console.log(`Valid actions: ${history.length}`);
  console.log(`Rejected actions: 2 (commitment violation, locality violation)`);

  console.log('\n=== Framework Summary ===');
  console.log('Commitment Rule: ΔT≥0 ∧ ΔV≥0 ∧ ΔF≥0 ∧ ΔC≥0');
  console.log('Locality Condition: Only claim what is locally observable');
  console.log('\n"Reality as a network, not a throne."');
  console.log('Nodes gain influence by becoming observable, predictable, and cooperative.');
}

// Run the example
main().catch(console.error);
