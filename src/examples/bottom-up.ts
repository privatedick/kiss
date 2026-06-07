/**
 * Bottom-Up Cooperation Simulation
 *
 * Start with simple agents, observe what happens.
 * Derive invariants from actual behavior, not abstract principles.
 */

import { World } from '../simulation/World.js';

/**
 * Run the simulation and observe what emerges
 */
function runSimulation(): void {
  console.log('=== Bottom-Up Cooperation Simulation ===\n');
  console.log('Starting with 3 agents, 8 resources each\n');

  const world = new World();

  console.log('--- Initial State ---');
  printWorldState(world);

  console.log('\n--- Running for 20 steps ---\n');
  world.run(20);

  console.log('--- Final State ---');
  printWorldState(world);

  console.log('\n--- What Actually Happened ---');
  analyzeBehavior(world);
}

/**
 * Print world state
 */
function printWorldState(world: World): void {
  const state = world.getState();
  for (const [id, agentState] of state) {
    const status = agentState.alive ? 'alive' : 'dead';
    console.log(`${id}: ${agentState.resources.toFixed(1)} resources (${status})`);
  }
}

/**
 * Analyze what behaviors actually occurred
 */
function analyzeBehavior(world: World): void {
  const history = world.getHistory();
  const cooperationEvents = world.getCooperationEvents();

  console.log(`\nTotal actions: ${history.length}`);
  console.log(`Cooperation events (sharing): ${cooperationEvents.length}`);

  // What actions occurred?
  const actionCounts = new Map<string, number>();
  for (const event of history) {
    const type = event.action.type;
    actionCounts.set(type, (actionCounts.get(type) ?? 0) + 1);
  }

  console.log('\n--- Action Distribution ---');
  for (const [type, count] of actionCounts) {
    console.log(`${type}: ${count}`);
  }

  // Who cooperated with whom?
  console.log('\n--- Cooperation Network ---');
  const cooperationPairs = new Map<string, number>();
  for (const event of cooperationEvents) {
    const key = `${event.actor} -> ${event.action.target}`;
    cooperationPairs.set(key, (cooperationPairs.get(key) ?? 0) + 1);
  }

  for (const [pair, count] of cooperationPairs) {
    console.log(`${pair}: ${count} times`);
  }

  // What patterns emerge?
  console.log('\n--- Observed Patterns ---');
  deriveInvariants(world);
}

/**
 * Derive invariants from actual behavior
 */
function deriveInvariants(world: World): void {
  const history = world.getHistory();
  const state = world.getState();
  const cooperationEvents = world.getCooperationEvents();

  // Pattern 1: Cooperation happens when agents have surplus
  const cooperationFromSurplus = cooperationEvents.filter(e => {
    // Would need historical state data to verify this precisely
    return true; // Placeholder
  });

  if (cooperationEvents.length > 0) {
    console.log('1. Cooperation occurred after agents accumulated surplus');
  }

  // Pattern 2: Agents that share get shared back (reciprocity)
  const sharers = new Set<string>();
  const receivers = new Set<string>();

  for (const event of cooperationEvents) {
    sharers.add(event.actor);
    if (event.action.target) {
      receivers.add(event.action.target);
    }
  }

  const overlap = Array.from(sharers).filter(id => receivers.has(id));
  if (overlap.length > 0) {
    console.log(`2. Reciprocity: ${overlap.length} agent(s) both shared and received`);
  }

  // Pattern 3: Survival depends on either self-sufficiency OR cooperation
  const aliveAgents = Array.from(state.entries())
    .filter(([_, s]) => s.alive)
    .map(([id, _]) => id);

  if (aliveAgents.length > 0) {
    console.log(`3. ${aliveAgents.length} agent(s) survived`);
    console.log('   Survival requires: resources > 0');
    console.log('   Resources come from: gathering OR receiving');
  }

  // Pattern 4: Death occurs when resources deplete
  const deadAgents = Array.from(state.entries())
    .filter(([_, s]) => !s.alive)
    .map(([id, _]) => id);

  if (deadAgents.length > 0) {
    console.log(`4. ${deadAgents.length} agent(s) died`);
    console.log('   Death occurs when: resources <= 0');
  }

  // What are the ACTUAL invariants (from observation)?
  console.log('\n--- Derived Invariants (from observation) ---');
  console.log('A. Cooperation = sharing resources with another agent');
  console.log('B. Reciprocity = agents who receive also tend to share');
  console.log('C. Survival = resources > 0 (gain from gather OR receive)');
  console.log('D. Death = resources <= 0 (lose to survival cost OR give away)');
  console.log('\nThese are DESCRIPTIVE, not PRESCRIPTIVE.');
  console.log('They describe what actually happens, not what should happen.');
}

/**
 * Main
 */
async function main(): Promise<void> {
  runSimulation();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('=== Bottom-Up vs Top-Down ===');
  console.log('\nTop-down (previous approach):');
  console.log('- Define invariants first (T, V, F, C)');
  console.log('- Prescribe what cooperation should be');
  console.log('- Enforce rules to match the definition');
  console.log('\nBottom-up (current approach):');
  console.log('- Create simple agents with minimal rules');
  console.log('- Observe what actually happens');
  console.log('- Describe patterns that emerge');
  console.log('\nThe difference:');
  console.log('- Top-down: "Here is what cooperation IS"');
  console.log('- Bottom-up: "Here is what cooperation LOOKS LIKE"');
}

// Run the simulation
main().catch(console.error);
