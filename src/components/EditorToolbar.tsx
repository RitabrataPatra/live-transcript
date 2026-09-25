import React from 'react';
import { TextSize } from '../types';
import {
  Undo,
  Redo,
  Search,
  Type,
  AlignLeft,
  Trash2,
  SlidersHorizontal,
  CornerDownLeft,
} from 'lucide-react';

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  textSize: TextSize;
  onChangeTextSize: (size: TextSize) => void;
  onInsertPunctuation: (char: string) => void;
  onFormatParagraphs: () => void;
  onSentenceCase: () => void;
  onToggleFindReplace: () => void;
  isFindReplaceOpen: boolean;
  onClear: () => void;
  hasContent: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  textSize,
  onChangeTextSize,
  onInsertPunctuation,
  onFormatParagraphs,
  onSentenceCase,
  onToggleFindReplace,
  isFindReplaceOpen,
  onClear,
  hasContent,
}) => {
  const textSizes: { label: string; value: TextSize }[] = [
    { label: 'Normal', value: 'base' },
    { label: 'Large', value: 'lg' },
    { label: 'X-Large', value: 'xl' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-b border-slate-200 text-xs text-slate-600 overflow-x-auto no-scrollbar">
      {/* Left: History & Quick Punctuation Bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-200 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-200 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Punctuation Keys - Visible on mobile too */}
        <div className="flex items-center gap-1 pl-1">
          {['.', ',', '?', '!'].map((char) => (
            <button
              key={char}
              onClick={() => onInsertPunctuation(char)}
              disabled={!hasContent}
              className="px-2 py-1 min-w-[24px] text-center font-mono font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-40"
              title={`Insert "${char}"`}
            >
              {char}
            </button>
          ))}
          <button
            onClick={() => onInsertPunctuation('\n\n')}
            disabled={!hasContent}
            className="inline-flex items-center gap-1 px-1.5 py-1 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-40"
            title="Insert new paragraph"
          >
            <CornerDownLeft className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] hidden xs:inline">Break</span>
          </button>
        </div>
      </div>

      {/* Right: Formatting Tools, Find/Replace & Size */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Paragraph Formatter */}
        <button
          onClick={onFormatParagraphs}
          disabled={!hasContent}
          className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-200 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors disabled:opacity-40"
          title="Format text into clean paragraphs"
          aria-label="Format paragraphs"
        >
          <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Auto-Paragraph</span>
        </button>

        {/* Sentence Case */}
        <button
          onClick={onSentenceCase}
          disabled={!hasContent}
          className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-200 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors disabled:opacity-40"
          title="Fix capitalization"
          aria-label="Sentence Case"
        >
          <Type className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Sentence Case</span>
        </button>

        {/* Find & Replace */}
        <button
          onClick={onToggleFindReplace}
          className={`inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border transition-colors ${
            isFindReplaceOpen
              ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
              : 'text-slate-700 hover:text-slate-900 active:bg-slate-200 bg-slate-100 hover:bg-slate-200/80 border-slate-200'
          }`}
          title="Find & Replace text"
          aria-label="Find & Replace"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Find</span>
        </button>

        {/* Text Size Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {textSizes.map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeTextSize(item.value)}
              className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all ${
                textSize === item.value
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label === 'Normal' ? 'A' : item.label === 'Large' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        {hasContent && (
          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-red-600 active:bg-red-100 hover:bg-red-50 rounded-md transition-colors"
            title="Clear all text"
            aria-label="Clear transcript"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
