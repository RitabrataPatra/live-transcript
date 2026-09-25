export type TranscriptionEngine = 'browser' | 'gemini';

export interface MobileTranscriptionOptions {
  engine: TranscriptionEngine;
  chunkDurationMs?: number;
  minSilenceMs?: number;
}
