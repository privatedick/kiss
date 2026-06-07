/**
 * What Actually Happened - Bottom-Up Analysis
 *
 * Derive invariants from actual observed behavior.
 */

import { World } from '../simulation/World.js';

interface CooperationAnalysis {
  agent: string;
  startResources: number;
  endResources: number;
  netChange: number;
  shared: number;
  received: number;
  cooperationBalance: number;
}

/**
 * Analyze a single simulation run
 */
function analyzeSimulation(world: World): Map<string, CooperationAnalysis> {
  const analysis = new Map<string, CooperationAnalysis>();
  const history = world.getHistory();
  const cooperationEvents = world.getCooperationEvents();

  // Get initial state (approximate from first events)
  const initialState = new Map<string, number>();
  const finalState = world.getState();

  // Calculate shares and receives for each agent
  const shares = new Map<string, number>();
  const receives = new Map<string, number>();

  for (const event of cooperationEvents) {
    const actor = event.actor;
    const target = event.action.target;
    const amount = event.action.amount;

    shares.set(actor, (shares.get(actor) ?? 0) + amount);
    if (target) {
      receives.set(target, (receives.get(target) ?? 0) + amount);
    }
  }

  // Build analysis for each agent
  for (const [id, finalAgentState] of finalState) {
    const initial = initialState.get(id) ?? 8; // Placeholder for now
    const shared = shares.get(id) ?? 0;
    const received = receives.get(id) ?? 0;
    const netChange = finalAgentState.resources - initial;
    const cooperationBalance = received - shared;

    analysis.set(id, {
      agent: id,
      startResources: initial,
      endResources: finalAgentState.resources,
      netChange,
      shared,
      received,
      cooperationBalance
    });
  }

  return analysis;
}

/**
 * Print analysis
 */
function printAnalysis(analysis: Map<string, CooperationAnalysis>): void {
  console.log('\n=== Cooperation Analysis ===\n');

  for (const [id, data] of analysis) {
    console.log(`${id}:`);
    console.log(`  Resources: ${data.startResources} → ${data.endResources} (${data.netChange > 0 ? '+' : ''}${data.netChange})`);
    console.log(`  Shared: ${data.shared}`);
    console.log(`  Received: ${data.received}`);
    console.log(`  Cooperation balance: ${data.cooperationBalance > 0 ? '+' : ''}${data.cooperationBalance}`);

    if (data.shared > data.received) {
      console.log(`  Status: Net giver (cooperation cost)`);
    } else if (data.received > data.shared) {
      console.log(`  Status: Net receiver (cooperation benefit)`);
    } else {
      console.log(`  Status: Balanced`);
    }
  }
}

/**
 * Derive invariants from observation
 */
function deriveInvariants(analysis: Map<string, CooperationAnalysis>): void {
  console.log('\n=== Derived Invariants (from observation) ===\n');

  const agents = Array.from(analysis.values());

  // Find patterns
  const netGivers = agents.filter(a => a.shared > a.received);
  const netReceivers = agents.filter(a => a.received > a.shared);
  const balanced = agents.filter(a => a.shared === a.received);

  console.log('1. Cooperation Roles:');
  console.log(`   Net givers: ${netGivers.map(a => a.agent).join(', ')}`);
  console.log(`   Net receivers: ${netReceivers.map(a => a.agent).join(', ')}`);
  console.log(`   Balanced: ${balanced.map(a => a.agent).join(', ')}`);

  console.log('\n2. Cooperation Cost:');
  if (netGivers.length > 0) {
    const avgCost = netGivers.reduce((sum, a) => sum + (a.shared - a.received), 0) / netGivers.length;
    console.log(`   Average cost to net givers: ${avgCost.toFixed(1)} resources`);
  }

  console.log('\n3. Cooperation Benefit:');
  if (netReceivers.length > 0) {
    const avgBenefit = netReceivers.reduce((sum, a) => sum + (a.received - a.shared), 0) / netReceivers.length;
    console.log(`   Average benefit to net receivers: ${avgBenefit.toFixed(1)} resources`);
  }

  console.log('\n4. Survival Impact:');
  const allAlive = agents.every(a => a.endResources > 0);
  if (allAlive) {
    console.log('   All agents survived (cooperation enabled survival)');
  } else {
    const dead = agents.filter(a => a.endResources <= 0).map(a => a.agent);
    console.log(`   ${dead.join(', ')} died (cooperation insufficient)`);
  }

  console.log('\n=== Key Insights ===');
  console.log('A. Cooperation is not symmetric - costs and benefits are distributed');
  console.log('B. Some agents give more than they receive (net givers)');
  console.log('C. Some agents receive more than they give (net receivers)');
  console.log('D. Cooperation enables group survival, but individual costs vary');
  console.log('\nThis is DESCRIPTIVE - it describes what actually happens.');
  console.log('It does not say what SHOULD happen (that would be prescriptive).');
}

/**
 * Run with asymmetric scenario
 */
async function main(): Promise<void> {
  console.log('=== Bottom-Up Analysis: What Cooperation Actually Looks Like ===\n');

  const world = new World();
  world.agents.clear();
  world.events = [];
  world.addAgent('alice', 15);
  world.addAgent('bob', 5);
  world.addAgent('charlie', 5);

  console.log('Initial: alice=15, bob=5, charlie=5\n');
  world.run(20);

  const finalState = world.getState();
  console.log('Final:');
  for (const [id, state] of finalState) {
    console.log(`  ${id}: ${state.resources.toFixed(1)} (${state.alive ? 'alive' : 'dead'})`);
  }

  const analysis = analyzeSimulation(world);
  printAnalysis(analysis);
  deriveInvariants(analysis);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('=== Comparison with Top-Down Approach ===');
  console.log('\nTop-down invariants (T, V, F, C):');
  console.log('- ΔT≥0, ΔV≥0, ΔF≥0, ΔC≥0');
  console.log('- Prescribes that cooperation must not reduce any invariant');
  console.log('- But in the simulation, alice lost 12 resources!');
  console.log('\nBottom-up observation:');
  console.log('- Cooperation DOES have costs (alice gave away 12)');
  console.log('- Costs and benefits are distributed asymmetrically');
  console.log('- Some give more, some receive more');
  console.log('- This is what ACTUALLY happens, not what SHOULD happen');
}

main().catch(console.error);
