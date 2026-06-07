/**
 * Axelrod-style Tournament
 *
 * Strategies play each other in round-robin format.
 * Tracks scores and ranks strategies.
 */

import type { Strategy, Move, History } from './Strategy.js';

export interface MatchResult {
  player1: string;
  player2: string;
  player1Score: number;
  player2Score: number;
  moves: Array<{ p1: Move; p2: Move }>;
}

export interface TournamentRanking {
  strategy: string;
  totalScore: number;
  avgScore: number;
  matches: number;
}

/**
 * Standard Prisoner's Dilemma payoffs
 * - Both cooperate: both get 3
 * - One cooperates, one defects: cooperator gets 0, defector gets 5
 * - Both defect: both get 1
 */
const PAYOFFS = {
  both_cooperate: 3,
  sucker: 0,        // I cooperate, you defect
  temptation: 5,   // I defect, you cooperate
  both_defect: 1
};

/**
 * Calculate payoff for a round
 */
function getPayoff(myMove: Move, oppMove: Move): number {
  if (myMove === 'cooperate' && oppMove === 'cooperate') {
    return PAYOFFS.both_cooperate;
  }
  if (myMove === 'cooperate' && oppMove === 'defect') {
    return PAYOFFS.sucker;
  }
  if (myMove === 'defect' && oppMove === 'cooperate') {
    return PAYOFFS.temptation;
  }
  return PAYOFFS.both_defect;
}

/**
 * Run one match between two strategies
 */
function runMatch(
  strategy1: Strategy,
  strategy2: Strategy,
  rounds: number = 200
): MatchResult {
  const history1: History = { myMoves: [], opponentMoves: [] };
  const history2: History = { myMoves: [], opponentMoves: [] };

  let score1 = 0;
  let score2 = 0;
  const moves: Array<{ p1: Move; p2: Move }> = [];

  // First moves
  const move1 = strategy1.firstMove;
  const move2 = strategy2.firstMove;

  history1.myMoves.push(move1);
  history1.opponentMoves.push(move2);
  history2.myMoves.push(move2);
  history2.opponentMoves.push(move1);

  score1 += getPayoff(move1, move2);
  score2 += getPayoff(move2, move1);
  moves.push({ p1: move1, p2: move2 });

  // Subsequent rounds
  for (let i = 1; i < rounds; i++) {
    const nextMove1 = strategy1.decide(history1);
    const nextMove2 = strategy2.decide(history2);

    history1.myMoves.push(nextMove1);
    history1.opponentMoves.push(nextMove2);
    history2.myMoves.push(nextMove2);
    history2.opponentMoves.push(nextMove1);

    score1 += getPayoff(nextMove1, nextMove2);
    score2 += getPayoff(nextMove2, nextMove1);
    moves.push({ p1: nextMove1, p2: nextMove2 });
  }

  return {
    player1: strategy1.name,
    player2: strategy2.name,
    player1Score: score1,
    player2Score: score2,
    moves
  };
}

/**
 * Run round-robin tournament
 */
export function runTournament(
  strategies: Strategy[],
  rounds: number = 200
): {
  matches: MatchResult[];
  rankings: TournamentRanking[];
} {
  const matches: MatchResult[] = [];
  const scores = new Map<string, number>();

  // Initialize scores
  for (const strategy of strategies) {
    scores.set(strategy.name, 0);
  }

  // Round-robin: each strategy plays every other
  for (let i = 0; i < strategies.length; i++) {
    for (let j = i; j < strategies.length; j++) {
      if (i === j) {
        // Strategy plays itself (for consistency)
        const match = runMatch(strategies[i], strategies[j], rounds);
        matches.push(match);
        scores.set(match.player1, scores.get(match.player1)! + match.player1Score);
        scores.set(match.player2, scores.get(match.player2)! + match.player2Score);
      } else {
        const match = runMatch(strategies[i], strategies[j], rounds);
        matches.push(match);
        scores.set(match.player1, scores.get(match.player1)! + match.player1Score);
        scores.set(match.player2, scores.get(match.player2)! + match.player2Score);
      }
    }
  }

  // Build rankings
  const rankings: TournamentRanking[] = Array.from(scores.entries()).map(([name, total]) => ({
    strategy: name,
    totalScore: total,
    avgScore: total / strategies.length,
    matches: strategies.length
  }));

  rankings.sort((a, b) => b.totalScore - a.totalScore);

  return { matches, rankings };
}
