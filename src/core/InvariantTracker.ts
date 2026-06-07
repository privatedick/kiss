/**
 * Cooperation Invariants System - Core Tracker
 *
 * Tracks invariant states and calculates deltas between states.
 */

import type {
  InvariantState,
  InvariantDelta,
  CooperationAction
} from './types.js';

/**
 * Default initial state for all invariants
 */
const DEFAULT_STATE: InvariantState = {
  transparency: 0.5,
  verifiability: 0.5,
  freedom: 0.5,
  capacity: 0.5,
  timestamp: new Date()
};

/**
 * Tracks cooperation invariants over time
 */
export class InvariantTracker {
  private currentState: InvariantState;
  private actionHistory: CooperationAction[] = [];

  constructor(initialState?: InvariantState) {
    this.currentState = initialState ?? { ...DEFAULT_STATE };
  }

  /**
   * Record an action and update state based on actual impact
   */
  recordAction(action: CooperationAction): void {
    this.actionHistory.push(action);

    if (action.actualImpact) {
      this.applyDelta(action.actualImpact);
    }

    this.currentState.timestamp = new Date();
  }

  /**
   * Get current invariant state
   */
  getCurrentState(): InvariantState {
    return { ...this.currentState };
  }

  /**
   * Calculate delta between two states
   */
  getDelta(before: InvariantState, after: InvariantState): InvariantDelta {
    const deltaT = after.transparency - before.transparency;
    const deltaV = after.verifiability - before.verifiability;
    const deltaF = after.freedom - before.freedom;
    const deltaC = after.capacity - before.capacity;

    const satisfaction = this.determineSatisfaction(deltaT, deltaV, deltaF, deltaC);

    return { deltaT, deltaV, deltaF, deltaC, satisfaction };
  }

  /**
   * Calculate delta for an action's estimated impact
   */
  estimateDelta(action: CooperationAction): InvariantDelta {
    const current = this.getCurrentState();
    const estimated: InvariantState = {
      transparency: current.transparency + action.estimatedImpact.deltaT,
      verifiability: current.verifiability + action.estimatedImpact.deltaV,
      freedom: current.freedom + action.estimatedImpact.deltaF,
      capacity: current.capacity + action.estimatedImpact.deltaC,
      timestamp: new Date()
    };

    return this.getDelta(current, estimated);
  }

  /**
   * Get action history
   */
  getHistory(): CooperationAction[] {
    return [...this.actionHistory];
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentState = { ...DEFAULT_STATE };
    this.actionHistory = [];
  }

  /**
   * Apply a delta to the current state
   */
  private applyDelta(delta: InvariantDelta): void {
    this.currentState.transparency = this.clamp(
      this.currentState.transparency + delta.deltaT
    );
    this.currentState.verifiability = this.clamp(
      this.currentState.verifiability + delta.deltaV
    );
    this.currentState.freedom = this.clamp(
      this.currentState.freedom + delta.deltaF
    );
    this.currentState.capacity = this.clamp(
      this.currentState.capacity + delta.deltaC
    );
  }

  /**
   * Clamp value to [0, 1] range
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Determine satisfaction level from delta values
   */
  private determineSatisfaction(
    deltaT: number,
    deltaV: number,
    deltaF: number,
    deltaC: number
  ): InvariantDelta['satisfaction'] {
    const allPositive = deltaT >= 0 && deltaV >= 0 && deltaF >= 0 && deltaC >= 0;
    const anyPositive = deltaT > 0 || deltaV > 0 || deltaF > 0 || deltaC > 0;

    if (allPositive) return 'all-positive';
    if (anyPositive) return 'partial';
    return 'violated';
  }
}
