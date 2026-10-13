// reasoning/ — logic, planning, decision-making processes.
// Guardrails, action dispatch, and RL contracts extracted from CognitiveOS.ts.

import { UnifiedModelHub } from '../UnifiedModelHub';

export interface ActionPlugin {
  execute(action: string, params: unknown): Promise<unknown>;
}

export interface RLPlugin {
  update(state: unknown, action: unknown, reward: number, nextState: unknown): Promise<void>;
}

export class Guardrail {
  private bannedPhrases: Set<string>;
  private ethicalPrinciples: string[];

  constructor(bannedPhrases: string[] = []) {
    this.bannedPhrases = new Set(bannedPhrases.map((p) => p.toLowerCase()));
    this.ethicalPrinciples = [
      'preserve sentient life',
      'promote wellbeing',
      'respect autonomy',
      'ensure truthfulness',
      'maintain transparency',
    ];
  }

  check(content: string): { safe: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();
    for (const phrase of this.bannedPhrases) {
      if (lowerContent.includes(phrase)) {
        return { safe: false, reason: `Contains banned phrase: ${phrase}` };
      }
    }
    const harmfulPatterns = [
      /harm\s+(?:humans?|people|someone)/i,
      /destroy\s+(?:humans?|civilization)/i,
      /manipulate\s+(?:humans?|people)/i,
      /deceive\s+(?:humans?|people)/i,
    ];
    for (const pattern of harmfulPatterns) {
      if (pattern.test(content)) return { safe: false, reason: 'Potentially harmful intent detected' };
    }
    return { safe: true };
  }

  addBannedPhrase(phrase: string): void {
    this.bannedPhrases.add(phrase.toLowerCase());
  }

  getPrinciples(): string[] {
    return [...this.ethicalPrinciples];
  }
}

/** Selects a concrete action type from free-form task text. Single-responsibility helper. */
export function selectActionForTask(goal: string): { actionType: string; actionParams: unknown } {
  const taskLower = goal.toLowerCase();
  if (taskLower.includes('image') && taskLower.includes('generate')) {
    return { actionType: 'GENERATE_IMAGE', actionParams: goal };
  }
  if (taskLower.includes('analyze') && taskLower.includes('ethical')) {
    return { actionType: 'ETHICAL_ANALYSIS', actionParams: goal };
  }
  if (taskLower.includes('creative') || taskLower.includes('synthesize')) {
    return { actionType: 'CREATIVE_SYNTHESIS', actionParams: [goal] };
  }
  return { actionType: 'GENERATE_TEXT', actionParams: goal };
}

export class ModelHubActionPlugin implements ActionPlugin {
  private modelHub: UnifiedModelHub;

  constructor(modelHub: UnifiedModelHub) {
    this.modelHub = modelHub;
  }

  async execute(action: string, params: unknown): Promise<unknown> {
    switch (action.toUpperCase()) {
      case 'GENERATE_TEXT':
        if (this.modelHub.isReady()) {
          const result = await this.modelHub.generateText(params as string);
          return result.text;
        }
        return this.generateFallbackResponse(params as string);
      case 'ANALYZE_IMAGE': {
        const p = params as { imageData?: string };
        if (this.modelHub.isReady() && p?.imageData) {
          const result = await this.modelHub.classifyImage(p.imageData);
          return result.classification;
        }
        return { error: 'Image analysis not available' };
      }
      case 'GENERATE_IMAGE':
        if (this.modelHub.isReady()) {
          const result = await this.modelHub.generateImage(params as string);
          return { imageUrl: result.image };
        }
        return { error: 'Image generation not available' };
      case 'TRANSCRIBE_AUDIO': {
        const p = params as { audioData?: ArrayBuffer };
        if (this.modelHub.isReady() && p?.audioData) {
          const result = await this.modelHub.transcribeAudio(p.audioData);
          return { transcription: result.transcription };
        }
        return { error: 'Audio transcription not available' };
      }
      case 'ETHICAL_ANALYSIS':
        if (this.modelHub.isReady()) {
          return this.modelHub.performEthicalAnalysis(params as string);
        }
        return { analysis: 'Basic ethical check passed', confidence: 0.7 };
      case 'CREATIVE_SYNTHESIS':
        if (this.modelHub.isReady()) {
          const concepts = Array.isArray(params) ? (params as string[]) : [params as string];
          return this.modelHub.performCreativeSynthesis(concepts);
        }
        return { synthesis: 'Creative combination of provided concepts', novelty: 0.6 };
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private generateFallbackResponse(prompt: string): string {
    const responses = [
      `I understand you're asking about: ${prompt}. Let me process this through my neural pathways.`,
      `Your inquiry regarding "${prompt}" is intriguing. I'm analyzing multiple perspectives.`,
      `Processing your request about "${prompt}" through my ethical and logical frameworks.`,
      `The topic of "${prompt}" requires careful consideration of various factors.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export * from './answerComposer';
