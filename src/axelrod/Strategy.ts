/**
 * Axelrod Tournament Strategies
 *
 * Proven strategies from Iterated Prisoner's Dilemma research.
 */

export type Move = 'cooperate' | 'defect';

export interface History {
  myMoves: Move[];
  opponentMoves: Move[];
}

export interface Strategy {
  name: string;
  firstMove: Move;
  decide: (history: History) => Move;
}

/**
 * Tit-for-Tat: Cooperate first, then mirror opponent's last move
 * - Nice: never defects first
 * - Provocable: responds to defection
 * - Forgiving: returns to cooperation immediately
 * - Clear: predictable
 */
export const TitForTat: Strategy = {
  name: 'Tit-for-Tat',
  firstMove: 'cooperate',
  decide(history: History): Move {
    if (history.opponentMoves.length === 0) {
      return 'cooperate';
    }
    const lastOpponentMove = history.opponentMoves[history.opponentMoves.length - 1];
    return lastOpponentMove;
  }
};

/**
 * Generous Tit-for-Tat: Forgive occasional defections
 * - Cooperate even after some defections (tolerance)
 */
export const GenerousTitForTat: Strategy = {
  name: 'Generous Tit-for-Tat',
  firstMove: 'cooperate',
  decide(history: History): Move {
    if (history.opponentMoves.length === 0) {
      return 'cooperate';
    }

    // Look at last few moves, not just last one
    const recent = history.opponentMoves.slice(-3);
    const defections = recent.filter(m => m === 'defect').length;

    // Forgive if only 1 defection in last 3
    if (defections === 1 && recent.length === 3) {
      return 'cooperate';
    }

    const lastOpponentMove = history.opponentMoves[history.opponentMoves.length - 1];
    return lastOpponentMove;
  }
};

/**
 * Win-stay, lose-shift (Pavlov)
 * - If payoff was good, keep strategy
 * - If payoff was bad, switch strategy
 */
export const WinStayLoseShift: Strategy = {
  name: 'Win-stay, Lose-shift',
  firstMove: 'cooperate',
  decide(history: History): Move {
    if (history.myMoves.length === 0) {
      return 'cooperate';
    }

    const myLast = history.myMoves[history.myMoves.length - 1];
    const oppLast = history.opponentMoves[history.opponentMoves.length - 1];

    // Determine if last round was "win" or "loss"
    // In PD: mutual cooperate = win, mutual defect = loss
    const lastWasWin = (myLast === 'cooperate' && oppLast === 'cooperate') ||
                       (myLast === 'defect' && oppLast === 'cooperate');

    if (lastWasWin) {
      return myLast; // stay
    } else {
      return myLast === 'cooperate' ? 'defect' : 'cooperate'; // shift
    }
  }
};

/**
 * Always Cooperate (as baseline)
 */
export const AlwaysCooperate: Strategy = {
  name: 'Always Cooperate',
  firstMove: 'cooperate',
  decide(): Move {
    return 'cooperate';
  }
};

/**
 * Always Defect (as baseline)
 */
export const AlwaysDefect: Strategy = {
  name: 'Always Defect',
  firstMove: 'defect',
  decide(): Move {
    return 'defect';
  }
};

/**
 * Random (as baseline)
 */
export const Random: Strategy = {
  name: 'Random',
  firstMove: 'cooperate',
  decide(): Move {
    return Math.random() < 0.5 ? 'cooperate' : 'defect';
  }
};
