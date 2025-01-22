import { HumeStreamChunk, LettaStreamChunk } from './types';

export class ResponseTransformer {
  private startTime: number;
  private lastProsodyScores: any;

  constructor() {
    this.startTime = Date.now();
    this.lastProsodyScores = {};
  }

  updateProsodyScores(scores: any) {
    this.lastProsodyScores = scores;
  }

  transformLettaToHume(chunk: LettaStreamChunk, model: string): HumeStreamChunk {
    const base = {
      id: chunk.id,
      created: Date.parse(chunk.date) / 1000,
      model,
      type: 'assistant_input' as const,
      choices: [{
        index: 0,
        delta: {
          role: 'assistant',
          content: ''
        },
        finish_reason: null,
        logprobs: null,
        models: {
          prosody: {
            scores: this.lastProsodyScores
          }
        },
        time: {
          begin: this.startTime,
          end: Date.now()
        }
      }]
    };

    switch (chunk.message_type) {
      case 'internal_monologue':
        if (chunk.internal_monologue) {
          base.choices[0].delta.content = chunk.internal_monologue;
        }
        break;

      case 'function_call':
        if (chunk.function_call) {
          base.choices[0].delta.content = `[Function Call: ${chunk.function_call.name}]`;
        }
        break;

      case 'function_return':
        if (chunk.function_return) {
          base.choices[0].delta.content = `[Function Result: ${chunk.function_return}]`;
        }
        break;
    }

    return base;
  }

  createEndMessage(): HumeStreamChunk {
    return {
      id: 'end',
      created: Date.now() / 1000,
      model: '',
      type: 'assistant_end',
      choices: [{
        index: 0,
        delta: {
          role: 'assistant',
          content: ''
        },
        finish_reason: 'stop',
        logprobs: null,
        models: {
          prosody: {
            scores: this.lastProsodyScores
          }
        },
        time: {
          begin: this.startTime,
          end: Date.now()
        }
      }]
    };
  }
} 