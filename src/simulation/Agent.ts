/**
 * Bottom-Up Cooperation Simulation - Agent
 *
 * Minimal agent with simple rules. Observations come from behavior.
 */

export interface AgentState {
  resources: number;
  alive: boolean;
}

export interface Action {
  type: 'gather' | 'share' | 'keep' | 'observe';
  amount: number;
  target?: string; // agent id
}

export interface Observation {
  observer: string;
  observed: string;
  action: Action;
  timestamp: number;
}

/**
 * Minimal agent with simple goals
 */
export class Agent {
  id: string;
  state: AgentState;
  memory: Observation[] = [];

  constructor(id: string, initialResources: number = 10) {
    this.id = id;
    this.state = {
      resources: initialResources,
      alive: initialResources > 0
    };
  }

  /**
   * Decide what to do based on current state
   * Minimal rules: survive if possible, help if affordable
   */
  decide(context: {
    selfState: AgentState;
    others: Map<string, AgentState>;
    step: number;
  }): Action {
    const { selfState, others, step } = context;

    // If starving, keep resources
    if (selfState.resources < 2) {
      return { type: 'keep', amount: 0 };
    }

    // If someone shared with you recently, return the favor
    const recentShares = this.memory.filter(obs =>
      obs.observed !== this.id &&
      obs.action.type === 'share' &&
      obs.action.target === this.id &&
      (step - obs.timestamp) < 5
    );

    if (recentShares.length > 0 && selfState.resources > 3) {
      // Share with someone who helped you
      const helper = recentShares[recentShares.length - 1].observed;
      return { type: 'share', amount: 1, target: helper };
    }

    // If doing well and someone else needs help, share
    if (selfState.resources > 5) {
      for (const [otherId, otherState] of others) {
        if (otherState.resources < selfState.resources - 3 && otherState.alive) {
          return { type: 'share', amount: 1, target: otherId };
        }
      }
    }

    // Otherwise, gather/keep
    return { type: 'gather', amount: 1 };
  }

  /**
   * Execute an action and update state
   */
  execute(action: Action, worldState: Map<string, AgentState>): void {
    if (!this.state.alive) return;

    switch (action.type) {
      case 'gather':
        this.state.resources += action.amount;
        break;
      case 'share':
        if (action.target && worldState.has(action.target)) {
          const target = worldState.get(action.target)!;
          if (target.alive && this.state.resources >= action.amount) {
            this.state.resources -= action.amount;
            target.resources += action.amount;
          }
        }
        break;
      case 'keep':
        // Do nothing, keep resources
        break;
      case 'observe':
        // Just observe, no state change
        break;
    }

    // Survival cost
    this.state.resources -= 0.5;
    if (this.state.resources <= 0) {
      this.state.alive = false;
      this.state.resources = 0;
    }
  }

  /**
   * Observe another agent's action
   */
  observe(observedAgent: string, action: Action, timestamp: number): void {
    this.memory.push({
      observer: this.id,
      observed: observedAgent,
      action,
      timestamp
    });

    // Keep memory bounded
    if (this.memory.length > 50) {
      this.memory.shift();
    }
  }
}
