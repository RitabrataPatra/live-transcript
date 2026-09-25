/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { AudioVisualizer } from './components/AudioVisualizer';
import { EditorToolbar } from './components/EditorToolbar';
import { FindReplaceBar } from './components/FindReplaceBar';
import { TranscriptionEditor } from './components/TranscriptionEditor';
import { ActionControls } from './components/ActionControls';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShareModal } from './components/ShareModal';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { getLanguageByCode } from './constants/languages';
import { Language, SavedTranscript, TextSize, TranscriptSegment, ExportFormat } from './types';
import { exportTranscript, copyToClipboard } from './utils/exportUtils';
import { Sparkles, Mic, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'transcribelive_saved_sessions_v1';
const CURRENT_SESSION_KEY = 'transcribelive_current_draft_v1';

export default function App() {
  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    return getLanguageByCode('en-US');
  });

  // Transcript Text & Structure
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string>('Live Session');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Undo / Redo history stack
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // UI state
  const [textSize, setTextSize] = useState<TextSize>('base');
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Transcripts
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscript[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not load stored transcripts', e);
      return [];
    }
  });

  // Speech Recognition hook
  const handleFinalSpeechChunk = useCallback((chunk: string, segment: TranscriptSegment) => {
    setTranscriptText((prev) => {
      // Save state to undo stack before appending
      setUndoStack((hist) => [...hist.slice(-25), prev]);
      setRedoStack([]);

      const trimmedPrev = prev.trimEnd();
      const needsSpace = trimmedPrev.length > 0 && !/[\s\n]$/.test(trimmedPrev);
      const newText = needsSpace ? `${trimmedPrev} ${chunk}` : `${trimmedPrev}${chunk}`;
      return newText;
    });

    setSegments((prev) => [...prev, segment]);
  }, []);

  const {
    isListening,
    interimText,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  } = useSpeechRecognition({
    languageCode: selectedLanguage.code,
    onFinalTranscript: handleFinalSpeechChunk,
  });

  // Audio Visualizer & Level Meter
  const {
    canvasRef,
    audioLevel,
    startAudioContext,
    stopAudioContext,
    hasAudioPermission,
  } = useAudioVisualizer(isListening);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync listening with audio visualizer stream
  useEffect(() => {
    if (isListening) {
      startAudioContext();
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
    } else {
      stopAudioContext();
    }
  }, [isListening, startAudioContext, stopAudioContext, sessionStartTime]);

  // Duration Timer
  useEffect(() => {
    let interval: number | null = null;
    if (isListening) {
      interval = window.setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Save to localStorage whenever savedTranscripts changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedTranscripts));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [savedTranscripts]);

  // Global Keyboard Shortcuts (Space for toggle when not focused on textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'textarea' || activeTag === 'input';

      if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        toggleListening();
      }

      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInputFocused) {
          e.preventDefault();
          handleUndo();
        }
      }

      // Ctrl+Y or Cmd+Shift+Z for Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInputFocused) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Ctrl+F for Find
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Text Change with Undo support
  const handleTextChange = (newText: string) => {
    setUndoStack((prev) => [...prev.slice(-25), transcriptText]);
    setRedoStack([]);
    setTranscriptText(newText);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [transcriptText, ...prev]);
    setUndoStack((prev) => prev.slice(0, -1));
    setTranscriptText(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack((prev) => prev.slice(1));
    setTranscriptText(next);
  };

  // Insert Punctuation
  const handleInsertPunctuation = (char: string) => {
    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack([]);
    setTranscriptText((prev) => {
      const trimmed = prev.trimEnd();
      if (char === '\n\n') {
        return `${trimmed}\n\n`;
      }
      return `${trimmed}${char} `;
    });
  };

  // Format Paragraphs
  const handleFormatParagraphs = () => {
    if (!transcriptText.trim()) return;
    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack([]);

    // Split sentences and group into ~3 sentences per paragraph
    const sentences = transcriptText
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);

    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    sentences.forEach((sentence, idx) => {
      currentParagraph.push(sentence);
      if (currentParagraph.length >= 3 || idx === sentences.length - 1) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });

    setTranscriptText(paragraphs.join('\n\n'));
    showToast('Auto-formatted into paragraphs');
  };

  // Sentence Case Capitalization
  const handleSentenceCase = () => {
    if (!transcriptText.trim()) return;
    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack([]);

    const formatted = transcriptText.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, boundary, char) => {
      return boundary + char.toUpperCase();
    });

    setTranscriptText(formatted);
    showToast('Applied sentence capitalization');
  };

  // Find and Replace
  const handleFindReplace = (find: string, replaceWith: string, replaceAll: boolean) => {
    if (!find) return;
    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack([]);

    if (replaceAll) {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      setTranscriptText((prev) => prev.replace(regex, replaceWith));
      showToast(`Replaced all occurrences of "${find}"`);
    } else {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      setTranscriptText((prev) => prev.replace(regex, replaceWith));
      showToast(`Replaced first occurrence of "${find}"`);
    }
  };

  // Clear current transcript
  const handleClearTranscript = () => {
    if (!transcriptText.trim()) return;
    if (window.confirm('Are you sure you want to clear the transcript?')) {
      setUndoStack((prev) => [...prev, transcriptText]);
      setRedoStack([]);
      setTranscriptText('');
      setSegments([]);
      showToast('Transcript cleared');
    }
  };

  // Save current transcript to history drawer
  const autoSaveCurrentSession = useCallback(() => {
    if (!transcriptText.trim()) return;

    const words = transcriptText.trim().split(/\s+/).filter(Boolean).length;
    const firstFewWords = transcriptText
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(' ');
    const title = sessionTitle !== 'Live Session' ? sessionTitle : `${firstFewWords}...`;

    const newRecord: SavedTranscript = {
      id: `transcript_${Date.now()}`,
      title: title || 'Untitled Transcript',
      text: transcriptText.trim(),
      segments,
      languageCode: selectedLanguage.code,
      languageName: selectedLanguage.name,
      createdAt: sessionStartTime || Date.now(),
      updatedAt: Date.now(),
      durationSeconds: Math.max(durationSeconds, 1),
      wordCount: words,
    };

    setSavedTranscripts((prev) => [newRecord, ...prev.filter((p) => p.text !== newRecord.text)]);
  }, [transcriptText, sessionTitle, segments, selectedLanguage, sessionStartTime, durationSeconds]);

  // Load sample dictation for testing
  const handleLoadSample = () => {
    const sample = `Welcome to the live speech transcription session. This application provides real-time voice-to-text recognition with instant interim results, multi-language switching, and live inline editing.

You can edit words directly in the editor as they appear, inject punctuation with a single click, convert into formatted paragraphs, and find and replace phrases across the transcript.

Once you are done recording or dictating, your transcript can be copied to your clipboard, shared with teammates, and saved directly as a text file for future reference.`;

    setUndoStack((prev) => [...prev, transcriptText]);
    setRedoStack([]);
    setTranscriptText(sample);
    setSessionTitle('Live Transcription Demo');
    setDurationSeconds(75);
    setSessionStartTime(Date.now() - 75000);
    showToast('Loaded sample transcript');
  };

  // Start fresh transcript session
  const handleNewSession = () => {
    if (transcriptText.trim()) {
      autoSaveCurrentSession();
    }
    if (isListening) {
      stopListening();
    }
    setTranscriptText('');
    setSegments([]);
    setSessionTitle('Live Session');
    setDurationSeconds(0);
    setSessionStartTime(null);
    setUndoStack([]);
    setRedoStack([]);
    showToast('Started new transcript session');
  };

  // Load transcript from history
  const handleLoadTranscript = (item: SavedTranscript) => {
    if (transcriptText.trim() && transcriptText !== item.text) {
      autoSaveCurrentSession();
    }
    if (isListening) {
      stopListening();
    }
    setTranscriptText(item.text);
    setSegments(item.segments || []);
    setSessionTitle(item.title);
    setDurationSeconds(item.durationSeconds || 0);
    const lang = getLanguageByCode(item.languageCode);
    setSelectedLanguage(lang);
    setUndoStack([]);
    setRedoStack([]);
    showToast(`Loaded "${item.title}"`);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!transcriptText.trim()) return;
    const success = await copyToClipboard(transcriptText);
    if (success) {
      setIsCopied(true);
      showToast('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Share
  const handleShare = async () => {
    if (!transcriptText.trim()) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle || 'Live Transcript',
          text: transcriptText,
        });
      } catch (err) {
        // Fall back to modal if user cancelled or API refused
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Export File (Txt, Md, Srt, Json)
  const handleExport = (format: ExportFormat) => {
    if (!transcriptText.trim()) return;
    exportTranscript(
      {
        title: sessionTitle || 'transcript',
        text: transcriptText,
        segments,
        languageName: selectedLanguage.name,
        createdAt: sessionStartTime || Date.now(),
        durationSeconds,
      },
      format
    );
    showToast(`Downloaded .${format} file`);
  };

  // Read Aloud / Listen (Text-to-speech)
  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!transcriptText.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcriptText);
    utterance.lang = selectedLanguage.code;
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Word count
  const wordCount = transcriptText.trim()
    ? transcriptText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Google Translate Style Header */}
      <Header
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          showToast(`Switched language to ${lang.name}`);
        }}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onNewSession={handleNewSession}
        savedCount={savedTranscripts.length}
        isListening={isListening}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 flex flex-col">
        {/* Workspace Title & Quick Context */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4 px-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="text-sm sm:text-lg font-bold text-slate-800 bg-transparent hover:bg-white/80 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 rounded-lg px-2 py-0.5 transition-all outline-none truncate max-w-[180px] sm:max-w-none"
              placeholder="Session Title..."
            />
            <span className="text-xs text-slate-500 hidden sm:inline">
              · {selectedLanguage.flag} {selectedLanguage.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-white rounded-md border border-slate-200 shadow-2xs text-[11px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="hidden xs:inline">Live Speech-to-Text</span>
              <span className="xs:hidden">Live</span>
            </span>
          </div>
        </div>

        {/* Central Google Translate Style Card */}
        <div className="flex-1 bg-white rounded-xl sm:rounded-2xl shadow-xs sm:shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all">
          {/* Audio Visualizer & Waveform Bar */}
          <AudioVisualizer
            canvasRef={canvasRef}
            isListening={isListening}
            audioLevel={audioLevel}
            durationSeconds={durationSeconds}
            wordCount={wordCount}
            hasAudioPermission={hasAudioPermission}
          />

          {/* Real-time Editor Toolbar */}
          <EditorToolbar
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            textSize={textSize}
            onChangeTextSize={setTextSize}
            onInsertPunctuation={handleInsertPunctuation}
            onFormatParagraphs={handleFormatParagraphs}
            onSentenceCase={handleSentenceCase}
            onToggleFindReplace={() => setIsFindReplaceOpen(!isFindReplaceOpen)}
            isFindReplaceOpen={isFindReplaceOpen}
            onClear={handleClearTranscript}
            hasContent={transcriptText.length > 0}
          />

          {/* Inline Find & Replace Bar */}
          <FindReplaceBar
            isOpen={isFindReplaceOpen}
            onClose={() => setIsFindReplaceOpen(false)}
            onReplace={handleFindReplace}
            transcriptText={transcriptText}
          />

          {/* Main Transcription Area */}
          <TranscriptionEditor
            text={transcriptText}
            interimText={interimText}
            isListening={isListening}
            textSize={textSize}
            onChangeText={handleTextChange}
            onStartListening={startListening}
            onLoadSample={handleLoadSample}
            errorMessage={errorMessage}
            languageName={selectedLanguage.name}
          />

          {/* Bottom Action Controls Dock (Mic, Copy, Share, Save) */}
          <ActionControls
            isListening={isListening}
            onToggleListening={toggleListening}
            onCopy={handleCopy}
            isCopied={isCopied}
            onShare={handleShare}
            onExport={handleExport}
            onReadAloud={handleReadAloud}
            isSpeaking={isSpeaking}
            hasContent={transcriptText.length > 0}
            languageCode={selectedLanguage.code}
          />
        </div>

        {/* Quiet footer tip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <span>Tip: Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono text-[11px] shadow-2xs">
              Space
            </kbd>
            <span>to start or pause listening anytime</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Supports 40+ spoken languages & dialects</span>
            <span aria-hidden="true">·</span>
            <span>Real-time inline editing</span>
          </div>
        </div>
      </main>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          showToast(`Switched language to ${lang.name}`);
        }}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        savedTranscripts={savedTranscripts}
        onLoadTranscript={handleLoadTranscript}
        onDeleteTranscript={(id) => {
          setSavedTranscripts((prev) => prev.filter((p) => p.id !== id));
          showToast('Transcript deleted');
        }}
        onRenameTranscript={(id, newTitle) => {
          setSavedTranscripts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
          );
          showToast('Title updated');
        }}
        onClearAll={() => {
          if (window.confirm('Delete all saved transcripts from your browser?')) {
            setSavedTranscripts([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            showToast('All transcripts cleared');
          }
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={sessionTitle}
        transcriptText={transcriptText}
        languageName={selectedLanguage.name}
      />

      {/* Temporary Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
