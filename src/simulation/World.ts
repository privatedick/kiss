/**
 * Bottom-Up Cooperation Simulation - World
 *
 * Simple world where agents interact. We observe what happens.
 */

import { Agent, Action, Observation, AgentState } from './Agent.js';

export interface Interaction {
  actor: string;
  action: Action;
  witnesses: string[];
  step: number;
}

export interface WorldEvent {
  type: 'action' | 'death' | 'birth';
  step: number;
  data: any;
}

/**
 * Simple world where agents interact
 */
export class World {
  agents: Map<string, Agent> = new Map();
  events: WorldEvent[] = [];
  step = 0;

  constructor() {
    // Start with 3 agents
    this.addAgent('alice', 8);
    this.addAgent('bob', 8);
    this.addAgent('charlie', 8);
  }

  addAgent(id: string, resources: number): void {
    this.agents.set(id, new Agent(id, resources));
    this.events.push({
      type: 'birth',
      step: this.step,
      data: { id, resources }
    });
  }

  /**
   * Run one step of the simulation
   */
  tick(): void {
    this.step++;

    // Each agent decides and acts
    const actions = new Map<string, Action>();

    for (const [id, agent] of this.agents) {
      if (!agent.state.alive) continue;

      // Get current world state for decision making
      const worldStates = new Map<string, AgentState>();
      for (const [otherId, otherAgent] of this.agents) {
        worldStates.set(otherId, { ...otherAgent.state });
      }

      const action = agent.decide({
        selfState: { ...agent.state },
        others: worldStates,
        step: this.step
      });

      actions.set(id, action);

      // Everyone observes the action (simplified - full observability)
      for (const [observerId, observerAgent] of this.agents) {
        if (observerId !== id && observerAgent.state.alive) {
          observerAgent.observe(id, action, this.step);
        }
      }
    }

    // Execute all actions
    for (const [id, action] of actions) {
      const agent = this.agents.get(id);
      if (agent && agent.state.alive) {
        const worldStates = new Map<string, AgentState>();
        for (const [otherId, otherAgent] of this.agents) {
          worldStates.set(otherId, { ...otherAgent.state });
        }

        agent.execute(action, worldStates);

        this.events.push({
          type: 'action',
          step: this.step,
          data: { actor: id, action }
        });
      }
    }

    // Check for deaths
    for (const [id, agent] of this.agents) {
      if (!agent.state.alive && agent.state.resources === 0) {
        this.events.push({
          type: 'death',
          step: this.step,
          data: { id }
        });
      }
    }
  }

  /**
   * Run simulation for N steps
   */
  run(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.tick();

      // Check if everyone is dead
      const aliveCount = Array.from(this.agents.values()).filter(a => a.state.alive).length;
      if (aliveCount === 0) break;
    }
  }

  /**
   * Get current state
   */
  getState(): Map<string, AgentState> {
    const state = new Map<string, AgentState>();
    for (const [id, agent] of this.agents) {
      state.set(id, { ...agent.state });
    }
    return state;
  }

  /**
   * Get history of actions
   */
  getHistory(): Interaction[] {
    const interactions: Interaction[] = [];

    for (const event of this.events) {
      if (event.type === 'action') {
        const witnesses = Array.from(this.agents.keys())
          .filter(id => id !== event.data.actor);

        interactions.push({
          actor: event.data.actor,
          action: event.data.action,
          witnesses,
          step: event.step
        });
      }
    }

    return interactions;
  }

  /**
   * Get cooperation events (sharing actions)
   */
  getCooperationEvents(): Interaction[] {
    return this.getHistory().filter(i => i.action.type === 'share');
  }
}
