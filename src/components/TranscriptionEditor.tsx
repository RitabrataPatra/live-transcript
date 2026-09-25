import React, { useRef, useEffect, useState } from 'react';
import { TextSize } from '../types';
import { Mic, AlertCircle, Sparkles, Volume2 } from 'lucide-react';

interface TranscriptionEditorProps {
  text: string;
  interimText: string;
  isListening: boolean;
  textSize: TextSize;
  onChangeText: (newText: string) => void;
  onStartListening: () => void;
  onLoadSample?: () => void;
  errorMessage: string | null;
  languageName: string;
}

export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  text,
  interimText,
  isListening,
  textSize,
  onChangeText,
  onStartListening,
  onLoadSample,
  errorMessage,
  languageName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);

  // Text size classes
  const textSizeClasses: Record<TextSize, string> = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-xl leading-relaxed',
    xl: 'text-2xl leading-relaxed',
    '2xl': 'text-3xl leading-relaxed font-normal',
  };

  // Auto scroll to bottom when interim or new text arrives, unless user scrolled up
  useEffect(() => {
    if (!userIsScrolling && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [text, interimText, userIsScrolling]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    setUserIsScrolling(!isAtBottom);
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-[300px] sm:min-h-[380px] bg-white">
      {/* Error banner if permission or speech recognition error occurs */}
      {errorMessage && (
        <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 sm:gap-3 text-xs text-amber-900 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Microphone notice:</span> {errorMessage}
            <p className="mt-1 text-[11px] text-amber-700">
              Tip: Click the microphone or lock icon in your browser URL bar to allow microphone access, then press listen again.
            </p>
          </div>
        </div>
      )}

      {/* Main editable transcript container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[52vh] sm:max-h-[58vh] min-h-[260px] sm:min-h-[320px] focus-within:ring-0"
      >
        {text.length === 0 && !interimText ? (
          /* Empty State - Google Translate Clean Invitation */
          <div className="h-full min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center text-center p-3 sm:p-6 text-slate-400 select-none">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3 sm:mb-3.5 border border-blue-100">
              <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">
              Ready to transcribe in {languageName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 sm:mb-5 leading-normal">
              Tap the microphone button to start live transcribing. You can edit the words directly on screen anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <button
                onClick={onStartListening}
                className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Start Listening</span>
              </button>
              {onLoadSample && (
                <button
                  onClick={onLoadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Try Sample Notes</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Populated State with Live Inline Editing */
          <div className="relative flex flex-col gap-2 min-h-full">
            {/* The finalized, fully editable text area */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Live transcript appears here. You can click anywhere to edit directly..."
              rows={Math.max(6, text.split('\n').length + 2)}
              className={`w-full bg-transparent resize-none border-0 p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 font-normal ${textSizeClasses[textSize]}`}
              spellCheck={true}
            />

            {/* Real-time Interim Streaming Words (Spoken live right now) */}
            {interimText && (
              <div className="flex items-start gap-1.5 sm:gap-2 pt-1 animate-in fade-in duration-100">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Live
                </span>
                <span
                  className={`text-blue-600 font-normal italic tracking-wide ${textSizeClasses[textSize]}`}
                >
                  {interimText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Resume Auto-Scroll Button if user scrolled up */}
      {userIsScrolling && isListening && (
        <button
          onClick={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              setUserIsScrolling(false);
            }
          }}
          className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-medium rounded-full shadow-lg hover:bg-slate-900 active:bg-slate-950 transition-all flex items-center gap-1.5"
        >
          <span>Scroll to latest</span>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
        </button>
      )}
    </div>
  );
};
