/**
 * Bottom-Up Tracking System
 *
 * Track what actually happens, not what should happen.
 * Based on observed behavior, not abstract principles.
 */

export interface ShareEvent {
  step: number;
  from: string;
  to: string;
  amount: number;
}

export interface AgentBalance {
  shared: number;
  received: number;
  balance: number; // received - shared
}

export interface CooperationState {
  events: ShareEvent[];
  balances: Map<string, AgentBalance>;
  survival: Map<string, boolean>;
}

/**
 * Track cooperation from observation
 */
export class CooperationTracker {
  private events: ShareEvent[] = [];
  private balances: Map<string, AgentBalance> = new Map();
  private survival: Map<string, boolean> = new Map();

  /**
   * Record a sharing event (from observation)
   */
  recordShare(step: number, from: string, to: string, amount: number): void {
    this.events.push({ step, from, to, amount });

    // Update balances
    if (!this.balances.has(from)) {
      this.balances.set(from, { shared: 0, received: 0, balance: 0 });
    }
    if (!this.balances.has(to)) {
      this.balances.set(to, { shared: 0, received: 0, balance: 0 });
    }

    const fromBalance = this.balances.get(from)!;
    const toBalance = this.balances.get(to)!;

    fromBalance.shared += amount;
    fromBalance.balance -= amount;

    toBalance.received += amount;
    toBalance.balance += amount;
  }

  /**
   * Record survival state
   */
  recordSurvival(agent: string, alive: boolean): void {
    this.survival.set(agent, alive);
  }

  /**
   * Get current state
   */
  getState(): CooperationState {
    return {
      events: [...this.events],
      balances: new Map(this.balances),
      survival: new Map(this.survival)
    };
  }

  /**
   * Get net givers (shared > received)
   */
  getNetGivers(): string[] {
    return Array.from(this.balances.entries())
      .filter(([_, b]) => b.balance < 0)
      .map(([id, _]) => id);
  }

  /**
   * Get net receivers (received > shared)
   */
  getNetReceivers(): string[] {
    return Array.from(this.balances.entries())
      .filter(([_, b]) => b.balance > 0)
      .map(([id, _]) => id);
  }

  /**
   * Get balanced agents (shared == received)
   */
  getBalanced(): string[] {
    return Array.from(this.balances.entries())
      .filter(([_, b]) => b.balance === 0)
      .map(([id, _]) => id);
  }

  /**
   * Calculate average cost to net givers
   */
  avgCostToGivers(): number {
    const givers = this.getNetGivers();
    if (givers.length === 0) return 0;

    const totalCost = givers.reduce((sum, id) => {
      const balance = this.balances.get(id)!;
      return sum + Math.abs(balance.balance);
    }, 0);

    return totalCost / givers.length;
  }

  /**
   * Calculate average benefit to net receivers
   */
  avgBenefitToReceivers(): number {
    const receivers = this.getNetReceivers();
    if (receivers.length === 0) return 0;

    const totalBenefit = receivers.reduce((sum, id) => {
      const balance = this.balances.get(id)!;
      return sum + balance.balance;
    }, 0);

    return totalBenefit / receivers.length;
  }

  /**
   * Check if everyone survived
   */
  everyoneSurvived(): boolean {
    return Array.from(this.survival.values()).every(alive => alive);
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalEvents: number;
    netGivers: number;
    netReceivers: number;
    avgCost: number;
    avgBenefit: number;
    everyoneSurvived: boolean;
  } {
    return {
      totalEvents: this.events.length,
      netGivers: this.getNetGivers().length,
      netReceivers: this.getNetReceivers().length,
      avgCost: this.avgCostToGivers(),
      avgBenefit: this.avgBenefitToReceivers(),
      everyoneSurvived: this.everyoneSurvived()
    };
  }
}
