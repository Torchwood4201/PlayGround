// feedback.ts — logging, self-assessment, and self-calibration utilities.
// Each cognitive module reports outcomes here; the controller adjusts health
// and surfaces calibration signals (mirrors human metacognition).

export interface FeedbackSample {
  module: string;
  success: boolean;
  latencyMs: number;
  timestamp: number;
  notes?: string;
}

export class FeedbackTracker {
  private samples: FeedbackSample[] = [];
  constructor(private maxSamples = 200) {}

  record(sample: Omit<FeedbackSample, 'timestamp'>): FeedbackSample {
    const full: FeedbackSample = { ...sample, timestamp: Date.now() };
    this.samples.push(full);
    if (this.samples.length > this.maxSamples) {
      this.samples = this.samples.slice(-this.maxSamples);
    }
    return full;
  }

  successRate(module?: string): number {
    const relevant = module ? this.samples.filter((s) => s.module === module) : this.samples;
    if (relevant.length === 0) return 1;
    return relevant.filter((s) => s.success).length / relevant.length;
  }

  averageLatency(module?: string): number {
    const relevant = module ? this.samples.filter((s) => s.module === module) : this.samples;
    if (relevant.length === 0) return 0;
    return relevant.reduce((sum, s) => sum + s.latencyMs, 0) / relevant.length;
  }

  /** Suggests a calibration nudge: positive = healthy, negative = needs attention. */
  calibrationSignal(): number {
    if (this.samples.length === 0) return 0;
    const recent = this.samples.slice(-20);
    const rate = recent.filter((s) => s.success).length / recent.length;
    return rate - 0.8; // >0 healthy, <0 degrading
  }

  getSamples(): FeedbackSample[] {
    return [...this.samples];
  }
}
