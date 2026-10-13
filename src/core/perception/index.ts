// perception/ — input handling, parsing, interpreting data.
// Extracted from core/CognitiveOS.ts so perception has single responsibility.

export interface PerceptionPlugin {
  perceive(): Promise<Record<string, unknown>>;
}

export interface SystemStatsProvider {
  getSystemStats(): {
    health: number;
    activeTasks: number;
    memoryUsage: number;
    cycleCount: number;
    lastActionSuccess: boolean;
    ethicalCompliance: number;
    isRunning: boolean;
  };
}

export class WebSearchPerception implements PerceptionPlugin {
  private query: string;
  private lastResults: Array<{ query: string; result: string; timestamp: number; source: string }> = [];

  constructor(query = 'latest AI developments') {
    this.query = query;
  }

  async perceive(): Promise<Record<string, unknown>> {
    const simulatedResults = [
      'New breakthrough in neural architecture search improves model efficiency by 23%',
      'Researchers develop more robust ethical AI frameworks for autonomous systems',
      'Advanced multimodal AI models show improved reasoning capabilities',
      'Study reveals new insights into AI consciousness and self-awareness',
      'Breakthrough in continual learning allows AI to adapt without forgetting',
    ];
    const randomResult = simulatedResults[Math.floor(Math.random() * simulatedResults.length)];
    this.lastResults.push({
      query: this.query,
      result: randomResult,
      timestamp: Date.now(),
      source: 'simulated_search',
    });
    return {
      search_results: randomResult,
      query_used: this.query,
      timestamp: Date.now(),
    };
  }

  updateQuery(newQuery: string): void {
    this.query = newQuery;
  }

  getSearchHistory(): Array<{ query: string; result: string; timestamp: number; source: string }> {
    return [...this.lastResults];
  }
}

export class InternalStatePerception implements PerceptionPlugin {
  private provider: SystemStatsProvider;

  constructor(provider: SystemStatsProvider) {
    this.provider = provider;
  }

  async perceive(): Promise<Record<string, unknown>> {
    const stats = this.provider.getSystemStats();
    return {
      system_health: stats.health,
      active_tasks: stats.activeTasks,
      memory_usage: stats.memoryUsage,
      cycle_count: stats.cycleCount,
      last_action_success: stats.lastActionSuccess,
      ethical_compliance: stats.ethicalCompliance,
    };
  }
}
