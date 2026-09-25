export interface Language {
  code: string;
  name: string;
  nativeName: string;
  country: string;
  flag: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number; // millisecond timestamp relative to session start
  isFinal: boolean;
}

export interface SavedTranscript {
  id: string;
  title: string;
  text: string;
  segments: TranscriptSegment[];
  languageCode: string;
  languageName: string;
  createdAt: number;
  updatedAt: number;
  durationSeconds: number;
  wordCount: number;
}

export type ExportFormat = 'txt' | 'md' | 'srt' | 'json';

export type TextSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
