import React, { useState, useEffect } from 'react';
import { ExportFormat } from '../types';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Share2,
  Download,
  Volume2,
  VolumeX,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface ActionControlsProps {
  isListening: boolean;
  onToggleListening: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onShare: () => void;
  onExport: (format: ExportFormat) => void;
  onReadAloud: () => void;
  isSpeaking: boolean;
  hasContent: boolean;
  languageCode: string;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  isListening,
  onToggleListening,
  onCopy,
  isCopied,
  onShare,
  onExport,
  onReadAloud,
  isSpeaking,
  hasContent,
  languageCode,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setIsExportMenuOpen(false);
    if (isExportMenuOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isExportMenuOpen]);

  return (
    <div className="relative px-3 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left Action Icons (Google Translate style: TTS, Copy) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Read aloud (TTS) button */}
        <button
          onClick={onReadAloud}
          disabled={!hasContent}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
            isSpeaking
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-200 hover:bg-white bg-white/80 border-slate-200'
          } disabled:opacity-40 disabled:hover:bg-white/80`}
          title={isSpeaking ? 'Stop speech playback' : 'Listen / Read aloud (Text-to-Speech)'}
          aria-label={isSpeaking ? 'Stop read aloud' : 'Read aloud'}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4 animate-pulse text-blue-600" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={onCopy}
          disabled={!hasContent}
          className="relative inline-flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-2xs disabled:opacity-40"
          title="Copy transcript to clipboard"
          aria-label="Copy transcript"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold text-[11px] sm:text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          disabled={!hasContent}
          className="inline-flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-2xs disabled:opacity-40"
          title="Share transcript"
          aria-label="Share transcript"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Center: Prominent Microphone Control Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 sm:-top-7">
        <button
          onClick={onToggleListening}
          className={`relative group w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 active:scale-95 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 shadow-lg shadow-red-500/30 scale-105'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 shadow-lg shadow-blue-600/30 hover:scale-105'
          }`}
          title={isListening ? 'Stop listening' : 'Start live transcription'}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {/* Animated pulsing outer rings when recording */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></span>
              <span className="absolute -inset-2 rounded-full border border-red-300 animate-pulse opacity-40"></span>
            </>
          )}

          {isListening ? (
            <MicOff className="w-5 h-5 sm:w-7 sm:h-7" />
          ) : (
            <Mic className="w-5 h-5 sm:w-7 sm:h-7" />
          )}
        </button>
      </div>

      {/* Right: Save / Export Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExportMenuOpen(!isExportMenuOpen);
          }}
          disabled={!hasContent}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-slate-900"
          title="Save transcript as text file"
          aria-label="Save as File"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Save</span>
          <span className="hidden sm:inline">as File</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Dropdown Options */}
        {isExportMenuOpen && (
          <div
            className="absolute right-0 bottom-full mb-2 w-44 sm:w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              Download format
            </div>
            <button
              onClick={() => {
                onExport('txt');
                setIsExportMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 flex items-center justify-between transition-colors font-medium"
            >
              <span>Plain Text (.txt)</span>
              <span className="text-[10px] text-slate-400 font-mono">Default</span>
            </button>
            <button
              onClick={() => {
                onExport('md');
                setIsExportMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 flex items-center justify-between transition-colors font-medium"
            >
              <span>Markdown (.md)</span>
              <span className="text-[10px] text-slate-400 font-mono">Rich</span>
            </button>
            <button
              onClick={() => {
                onExport('srt');
                setIsExportMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 flex items-center justify-between transition-colors font-medium"
            >
              <span>Subtitles (.srt)</span>
              <span className="text-[10px] text-slate-400 font-mono">Timestamps</span>
            </button>
            <button
              onClick={() => {
                onExport('json');
                setIsExportMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 flex items-center justify-between transition-colors font-medium"
            >
              <span>Raw JSON (.json)</span>
              <span className="text-[10px] text-slate-400 font-mono">Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
