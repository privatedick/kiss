/**
 * Axelrod Tournament Example
 *
 * Run proven strategies and see what emerges.
 */

import { runTournament } from '../axelrod/Tournament.js';
import {
  TitForTat,
  GenerousTitForTat,
  WinStayLoseShift,
  AlwaysCooperate,
  AlwaysDefect,
  Random
} from '../axelrod/Strategy.js';

async function main(): Promise<void> {
  console.log('=== Axelrod Tournament ===\n');
  console.log('Strategies compete in round-robin format');
  console.log('200 rounds per match\n');

  const strategies = [
    TitForTat,
    GenerousTitForTat,
    WinStayLoseShift,
    AlwaysCooperate,
    AlwaysDefect,
    Random
  ];

  const { matches, rankings } = runTournament(strategies, 200);

  console.log('--- Rankings ---');
  console.log('Rank | Strategy               | Total | Average');
  console.log('-----|------------------------|-------|----------');

  rankings.forEach((rank, index) => {
    const place = index + 1;
    const name = rank.strategy.padEnd(22);
    const total = rank.totalScore.toString().padStart(5);
    const avg = rank.avgScore.toFixed(1).padStart(6);

    console.log(` ${place}   | ${name} | ${total}  | ${avg}`);
  });

  console.log('\n--- Key Insights ---');
  const winner = rankings[0];
  console.log(`\nWinner: ${winner.strategy}`);
  console.log(`Score: ${winner.totalScore} (avg ${winner.avgScore.toFixed(1)} per match)`);

  // Analyze why the winner won
  console.log('\n--- What Works ---');
  console.log('1. Nice strategies (never defect first) outperform mean ones');
  console.log('2. Provocable strategies (respond to defection) prevent exploitation');
  console.log('3. Forgiving strategies (return to cooperation) build mutual benefit');
  console.log('4. Clear strategies (predictable) enable reciprocity');

  console.log('\n--- What Fails ---');
  const loser = rankings[rankings.length - 1];
  console.log(`\nLoser: ${loser.strategy}`);
  console.log(`Score: ${loser.totalScore} (avg ${loser.avgScore.toFixed(1)} per match)`);

  if (loser.strategy === 'Always Defect') {
    console.log('\nAlways Defect fails because:');
    console.log('- Triggers retaliation from nice strategies');
    console.log('- Misses opportunities for mutual cooperation');
    console.log('- Earns only 1 point per round vs 3 for mutual cooperation');
  }

  if (loser.strategy === 'Always Cooperate') {
    console.log('\nAlways Cooperate fails because:');
    console.log('- Exploited by defecting strategies');
    console.log('- Earns 0 points against defectors');
    console.log('- Cannot protect itself');
  }

  if (loser.strategy === 'Random') {
    console.log('\nRandom fails because:');
    console.log('- Unpredictable, prevents reciprocity');
    console.log('- Misses patterns of cooperation');
    console.log('- Triggers unnecessary defections');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('=== Emergence of Cooperation ===');
  console.log('\nCooperation emerges from:');
  console.log('1. Repeated interactions (not one-shot games)');
  console.log('2. Memory of past interactions');
  console.log('3. Ability to recognize other agents');
  console.log('4. Strategies that are nice, provocable, forgiving, clear');

  console.log('\nThis is BOTTOM-UP knowledge:');
  console.log('- Not pre-programmed "cooperation rules"');
  console.log('- Emerges from strategy interactions');
  console.log('- Tested across thousands of simulations');
  console.log('- Proven to work across contexts');

  console.log('\nCompare with my earlier approach:');
  console.log('- Top-down: "Cooperation IS ΔT≥0 ∧ ΔV≥0..."');
  console.log('- Bottom-up (Axelrod): "Here are strategies that work"');
  console.log('\nThe second is tested knowledge from asymmetry.');
}

main().catch(console.error);
