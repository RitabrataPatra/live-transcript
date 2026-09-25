import React from 'react';
import { formatDuration } from '../utils/exportUtils';
import { Activity, Clock, Mic, MicOff, Volume2 } from 'lucide-react';

interface AudioVisualizerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isListening: boolean;
  audioLevel: number;
  durationSeconds: number;
  wordCount: number;
  hasAudioPermission: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  canvasRef,
  isListening,
  audioLevel,
  durationSeconds,
  wordCount,
  hasAudioPermission,
}) => {
  // Words per minute calculation
  const minutes = durationSeconds / 60;
  const wpm = minutes > 0.1 ? Math.round(wordCount / minutes) : 0;

  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
      {/* Left: Status & Audio Energy */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isListening ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-300"></span>
          )}
          <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
            {isListening ? 'Listening' : 'Ready'}
          </span>
        </div>

        {/* Audio canvas / Waveform visualizer */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <canvas
            ref={canvasRef}
            width={120}
            height={20}
            className="w-[70px] sm:w-[120px] h-[18px] sm:h-[22px] bg-slate-100/70 rounded-md"
            title="Real-time microphone audio input visualizer"
          />
          {isListening && (
            <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
              <span className="tabular-nums font-mono">{audioLevel}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Timer & Metrics */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Session timer */}
        <div className="flex items-center gap-1 sm:gap-1.5 font-mono tabular-nums text-slate-700 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200 shadow-2xs text-[11px] sm:text-xs">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
          <span>{formatDuration(durationSeconds)}</span>
        </div>

        {/* Word count & Pace */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-slate-500 text-[11px] sm:text-xs">
          <span>
            <strong className="font-semibold text-slate-700 font-mono tabular-nums">{wordCount}</strong>
            <span className="hidden xs:inline"> words</span>
            <span className="xs:hidden">w</span>
          </span>
          {isListening && wpm > 0 && (
            <>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                <strong className="font-semibold text-slate-700 font-mono tabular-nums">{wpm}</strong> WPM
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
