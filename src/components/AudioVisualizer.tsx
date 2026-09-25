import React from 'react';
import { formatDuration } from '../utils/exportUtils';
import { TranscriptionEngine } from '../types/engine';
import { Activity, Clock, Mic, MicOff, Volume2, Sparkles, Cpu } from 'lucide-react';

interface AudioVisualizerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isListening: boolean;
  audioLevel: number;
  durationSeconds: number;
  wordCount: number;
  hasAudioPermission: boolean;
  engine: TranscriptionEngine;
  onToggleEngine: () => void;
  isAiProcessing?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  canvasRef,
  isListening,
  audioLevel,
  durationSeconds,
  wordCount,
  hasAudioPermission,
  engine,
  onToggleEngine,
  isAiProcessing,
}) => {
  // Words per minute calculation
  const minutes = durationSeconds / 60;
  const wpm = minutes > 0.1 ? Math.round(wordCount / minutes) : 0;

  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
      {/* Left: Status & Audio Energy */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {isListening ? (
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-slate-300"></span>
          )}
          <span className="font-semibold text-slate-800 text-[10px] sm:text-xs">
            {isListening ? (isAiProcessing ? 'Transcribing...' : 'Listening') : 'Ready'}
          </span>
        </div>

        {/* Audio canvas / Waveform visualizer */}
        <div className="flex items-center gap-1 pl-1.5 sm:pl-2 border-l border-slate-200">
          <canvas
            ref={canvasRef}
            width={120}
            height={20}
            className="w-[60px] sm:w-[100px] h-[16px] sm:h-[20px] bg-slate-100/70 rounded-md"
            title="Real-time microphone audio input visualizer"
          />
          {isListening && (
            <div className="hidden xs:flex items-center text-[10px] text-slate-500">
              <span className="tabular-nums font-mono">{audioLevel}%</span>
            </div>
          )}
        </div>

        {/* Engine Switcher (Gemini AI vs Browser STT) */}
        <button
          onClick={onToggleEngine}
          className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border transition-all ${
            engine === 'gemini'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs font-semibold'
              : 'bg-white text-slate-600 hover:text-slate-800 border-slate-200'
          }`}
          title={
            engine === 'gemini'
              ? 'AI Precision Engine active: Understands all accents & mobile speech'
              : 'Browser SpeechRecognition active'
          }
        >
          {engine === 'gemini' ? (
            <>
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="hidden xs:inline">Gemini AI</span>
              <span className="xs:hidden">AI</span>
            </>
          ) : (
            <>
              <Cpu className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="hidden xs:inline">Browser Engine</span>
              <span className="xs:hidden">Std</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Timer & Metrics */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Session timer */}
        <div className="flex items-center gap-1 font-mono tabular-nums text-slate-700 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-slate-200 shadow-2xs text-[10px] sm:text-xs">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatDuration(durationSeconds)}</span>
        </div>

        {/* Word count */}
        <div className="flex items-center gap-1 text-slate-500 text-[10px] sm:text-xs">
          <span>
            <strong className="font-semibold text-slate-700 font-mono tabular-nums">{wordCount}</strong>
            <span className="hidden xs:inline"> words</span>
            <span className="xs:hidden">w</span>
          </span>
        </div>
      </div>
    </div>
  );
};
