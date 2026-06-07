/**
 * Bottom-Up Tracking Example
 *
 * Track what actually happens, describe what you see.
 */

import { CooperationTracker } from '../bottomup/Tracker.js';
import { World } from '../simulation/World.js';

/**
 * Run simulation and track what actually happens
 */
async function main(): Promise<void> {
  console.log('=== Bottom-Up Tracking: What Actually Happens ===\n');

  // Create world with asymmetry
  const world = new World();
  world.agents.clear();
  world.events = [];
  world.addAgent('alice', 15);
  world.addAgent('bob', 5);
  world.addAgent('charlie', 5);

  // Create tracker
  const tracker = new CooperationTracker();

  console.log('Initial: alice=15, bob=5, charlie=5\n');

  // Run simulation and track events
  world.run(20);

  // Record all sharing events
  for (const event of world.getCooperationEvents()) {
    tracker.recordShare(
      event.step,
      event.actor,
      event.action.target ?? '',
      event.action.amount
    );
  }

  // Record survival
  const finalState = world.getState();
  for (const [id, state] of finalState) {
    tracker.recordSurvival(id, state.alive);
  }

  // Print what we observed
  console.log('--- Observed Events ---');
  const state = tracker.getState();
  for (const event of state.events.slice(0, 10)) {
    console.log(`Step ${event.step}: ${event.from} -> ${event.to} (${event.amount})`);
  }
  if (state.events.length > 10) {
    console.log(`... and ${state.events.length - 10} more events`);
  }

  console.log('\n--- Cooperation Balances ---');
  for (const [id, balance] of state.balances) {
    console.log(`${id}: shared ${balance.shared}, received ${balance.received}, balance ${balance.balance > 0 ? '+' : ''}${balance.balance}`);
  }

  console.log('\n--- Roles ---');
  console.log(`Net givers: ${tracker.getNetGivers().join(', ')}`);
  console.log(`Net receivers: ${tracker.getNetReceivers().join(', ')}`);
  console.log(`Balanced: ${tracker.getBalanced().join(', ')}`);

  console.log('\n--- Statistics ---');
  const summary = tracker.getSummary();
  console.log(`Total cooperation events: ${summary.totalEvents}`);
  console.log(`Net givers: ${summary.netGivers}`);
  console.log(`Net receivers: ${summary.netReceivers}`);
  console.log(`Average cost to givers: ${summary.avgCost.toFixed(1)} resources`);
  console.log(`Average benefit to receivers: ${summary.avgBenefit.toFixed(1)} resources`);
  console.log(`Everyone survived: ${summary.everyoneSurvived}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('=== What This Tells Us ===');
  console.log('\n1. Cooperation is observable (we tracked it)');
  console.log('2. Cooperation has costs (net givers pay)');
  console.log('3. Cooperation has benefits (net receivers gain)');
  console.log('4. Cooperation is asymmetric (not everyone pays/receives equally)');
  console.log('5. Cooperation can enable group survival');
  console.log('\nThese are OBSERVATIONS, not rules.');
  console.log('They describe what actually happened, not what should happen.');
  console.log('\nCompare to top-down:');
  console.log('- Top-down: "Cooperation must have Δ≥0 for all invariants"');
  console.log('- Bottom-up: "Cooperation has costs: alice paid 2, charlie paid 4"');
  console.log('\nThe first is a prescription. The second is an observation.');
}

main().catch(console.error);
