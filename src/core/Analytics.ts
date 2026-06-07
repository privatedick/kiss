/**
 * Cooperation Invariants System - Analytics
 *
 * Measures likelihood of successful outcomes under different conditions.
 */

import type {
  CooperationAction,
  InvariantDelta,
  ValidationResult
} from './types.js';
import { validateAction } from './validators.js';

/**
 * Simulation result for analytics
 */
export interface SimulationResult {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  successRate: number;
  failureByReason: {
    commitmentViolation: number;
    localityViolation: number;
    both: number;
  };
  invariantDistribution: {
    avgDeltaT: number;
    avgDeltaV: number;
    avgDeltaF: number;
    avgDeltaC: number;
  };
}

/**
 * Action pattern for simulation
 */
export interface ActionPattern {
  deltaT: number;
  deltaV: number;
  deltaF: number;
  deltaC: number;
  hasObservableFacts: boolean;
  localContext?: string;
  nonLocalKeywords?: string[];
}

/**
 * Analytics for measuring cooperation outcomes
 */
export class InvariantAnalytics {
  /**
   * Run simulation with random action patterns
   */
  static simulateRandomActions(count: number, seed?: number): SimulationResult {
    const rng = seed ? this.seededRandom(seed) : Math.random;

    let successful = 0;
    let commitmentViolations = 0;
    let localityViolations = 0;
    let bothViolations = 0;

    let sumDeltaT = 0;
    let sumDeltaV = 0;
    let sumDeltaF = 0;
    let sumDeltaC = 0;

    for (let i = 0; i < count; i++) {
      const pattern = this.randomActionPattern(rng);
      const result = this.validatePattern(pattern);

      if (result.valid) {
        successful++;
      } else {
        if (result.commitmentViolation && result.localityViolation) {
          bothViolations++;
        } else if (result.commitmentViolation) {
          commitmentViolations++;
        } else {
          localityViolations++;
        }
      }

      sumDeltaT += pattern.deltaT;
      sumDeltaV += pattern.deltaV;
      sumDeltaF += pattern.deltaF;
      sumDeltaC += pattern.deltaC;
    }

    return {
      totalActions: count,
      successfulActions: successful,
      failedActions: count - successful,
      successRate: successful / count,
      failureByReason: {
        commitmentViolation: commitmentViolations,
        localityViolation: localityViolations,
        both: bothViolations
      },
      invariantDistribution: {
        avgDeltaT: sumDeltaT / count,
        avgDeltaV: sumDeltaV / count,
        avgDeltaF: sumDeltaF / count,
        avgDeltaC: sumDeltaC / count
      }
    };
  }

  /**
   * Analyze likelihood of success for specific action pattern
   */
  static analyzePattern(pattern: ActionPattern): {
    valid: boolean;
    failureReasons: string[];
    successProbability: number;
  } {
    const result = this.validatePattern(pattern);

    const failureReasons: string[] = [];
    if (result.commitmentViolation) {
      const negatives = [];
      if (pattern.deltaT < 0) negatives.push('T');
      if (pattern.deltaV < 0) negatives.push('V');
      if (pattern.deltaF < 0) negatives.push('F');
      if (pattern.deltaC < 0) negatives.push('C');
      failureReasons.push(`Reduces ${negatives.join(', ')}`);
    }

    if (result.localityViolation) {
      if (!pattern.hasObservableFacts) {
        failureReasons.push('No observable facts');
      }
      if (pattern.nonLocalKeywords && pattern.nonLocalKeywords.length > 0) {
        failureReasons.push(`Non-local keywords: ${pattern.nonLocalKeywords.join(', ')}`);
      }
    }

    // Estimate success probability based on pattern characteristics
    let prob = 1.0;
    if (pattern.deltaT < 0) prob *= 0.1;
    if (pattern.deltaV < 0) prob *= 0.1;
    if (pattern.deltaF < 0) prob *= 0.1;
    if (pattern.deltaC < 0) prob *= 0.1;
    if (!pattern.hasObservableFacts) prob *= 0.7;
    if (pattern.nonLocalKeywords && pattern.nonLocalKeywords.length > 0) prob *= 0.5;

    return {
      valid: result.valid,
      failureReasons,
      successProbability: result.valid ? 1.0 : prob
    };
  }

  /**
   * Compare multiple action patterns
   */
  static comparePatterns(...patterns: ActionPattern[]): Array<{
    pattern: ActionPattern;
    valid: boolean;
    successProbability: number;
  }> {
    return patterns.map(pattern => ({
      pattern,
      ...this.analyzePattern(pattern)
    })).sort((a, b) => b.successProbability - a.successProbability);
  }

  /**
   * Validate a single pattern
   */
  private static validatePattern(pattern: ActionPattern): {
    valid: boolean;
    commitmentViolation: boolean;
    localityViolation: boolean;
  } {
    // Check commitment rule
    const commitmentViolation =
      pattern.deltaT < 0 ||
      pattern.deltaV < 0 ||
      pattern.deltaF < 0 ||
      pattern.deltaC < 0;

    // Check locality
    const localityViolation =
      !pattern.hasObservableFacts ||
      (pattern.nonLocalKeywords !== undefined && pattern.nonLocalKeywords.length > 0);

    return {
      valid: !commitmentViolation && !localityViolation,
      commitmentViolation,
      localityViolation
    };
  }

  /**
   * Generate random action pattern
   */
  private static randomActionPattern(rng: () => number): ActionPattern {
    const deltaT = (rng() * 0.6 - 0.3); // -0.3 to 0.3
    const deltaV = (rng() * 0.6 - 0.3);
    const deltaF = (rng() * 0.6 - 0.3);
    const deltaC = (rng() * 0.6 - 0.3);

    const hasObservableFacts = rng() > 0.3; // 70% chance
    const hasNonLocalKeywords = rng() > 0.8; // 20% chance

    const keywords = ['everyone', 'always', 'never', 'universal', 'absolute', 'global'];
    const nonLocalKeywords = hasNonLocalKeywords
      ? [keywords[Math.floor(rng() * keywords.length)]]
      : undefined;

    return {
      deltaT,
      deltaV,
      deltaF,
      deltaC,
      hasObservableFacts,
      localContext: 'simulated-context',
      nonLocalKeywords
    };
  }

  /**
   * Seeded random number generator for reproducible simulations
   */
  private static seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }
}
