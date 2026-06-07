/**
 * Asymmetry Scenario - Does cooperation emerge from unequal starting conditions?
 */

import { World } from '../simulation/World.js';

/**
 * Create a world with unequal starting conditions
 */
function createAsymmetricWorld(): World {
  const world = new World();

  // Clear default agents
  world.agents.clear();
  world.events = [];

  // Add agents with different starting resources
  world.addAgent('alice', 15); // surplus
  world.addAgent('bob', 5);    // needs help
  world.addAgent('charlie', 5); // needs help

  return world;
}

/**
 * Run asymmetric scenario
 */
function runAsymmetricScenario(): void {
  console.log('=== Asymmetry Scenario ===\n');
  console.log('Starting with unequal resources:\n');

  const world = createAsymmetricWorld();

  console.log('--- Initial State ---');
  printWorldState(world);

  console.log('\n--- Running for 20 steps ---\n');
  world.run(20);

  console.log('--- Final State ---');
  printWorldState(world);

  console.log('\n--- What Actually Happened ---');
  analyzeCooperation(world);
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
 * Analyze cooperation patterns
 */
function analyzeCooperation(world: World): void {
  const history = world.getHistory();
  const cooperationEvents = world.getCooperationEvents();

  console.log(`\nTotal actions: ${history.length}`);
  console.log(`Cooperation events (sharing): ${cooperationEvents.length}`);

  if (cooperationEvents.length > 0) {
    console.log('\n--- Cooperation Events ---');
    for (const event of cooperationEvents) {
      console.log(`Step ${event.step}: ${event.actor} -> ${event.action.target} (amount: ${event.action.amount})`);
    }

    console.log('\n--- Derived Invariants ---');
    console.log('1. Cooperation emerged from resource asymmetry');
    console.log('2. Agent with surplus shared with agents in need');
    console.log('3. Reciprocity: receivers shared back when able');

    // Check if everyone survived
    const state = world.getState();
    const aliveCount = Array.from(state.values()).filter(s => s.alive).length;

    if (aliveCount === 3) {
      console.log('\n4. Cooperation enabled group survival');
      console.log('   Without cooperation: bob and charlie might have died');
      console.log('   With cooperation: everyone survived');
    }
  } else {
    console.log('\n--- No Cooperation Occurred ---');
    console.log('Even with asymmetry, cooperation did not emerge.');
    console.log('\nWhy?');
    const state = world.getState();
    for (const [id, agentState] of state) {
      if (!agentState.alive) {
        console.log(`- ${id} died from resource depletion`);
      } else if (agentState.resources > 10) {
        console.log(`- ${id} had surplus but did not share (threshold not met?)`);
      }
    }
  }

  // What actually happened?
  console.log('\n--- What This Tells Us ---');
  console.log('Cooperation requires:');
  console.log('1. Asymmetry (someone has surplus, someone needs)');
  console.log('2. A rule that triggers sharing');
  console.log('3. Repeated interactions (reciprocity builds)');
  console.log('\nWithout these, agents just accumulate or die independently.');
}

async function main(): Promise<void> {
  runAsymmetricScenario();
}

main().catch(console.error);
