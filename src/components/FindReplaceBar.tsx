import React, { useState } from 'react';
import { Search, Replace, X, ChevronRight } from 'lucide-react';

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: (find: string, replaceWith: string, replaceAll: boolean) => void;
  transcriptText: string;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  onReplace,
  transcriptText,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  if (!isOpen) return null;

  // Count matches
  const matchCount = findText
    ? (transcriptText.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  const handleReplaceOne = () => {
    if (!findText) return;
    onReplace(findText, replaceText, false);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    onReplace(findText, replaceText, true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 sm:px-5 sm:py-2.5 bg-blue-50/80 border-b border-blue-200 text-xs text-slate-700 animate-in fade-in duration-150">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          placeholder="Find word or phrase..."
          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 sm:py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        {findText && (
          <span className="text-[10px] sm:text-[11px] text-slate-500 shrink-0 font-mono">
            {matchCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Replace className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace with..."
          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 sm:py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t border-blue-100 sm:border-0">
        <button
          onClick={handleReplaceOne}
          disabled={!findText || matchCount === 0}
          className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          Replace
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={!findText || matchCount === 0}
          className="px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 transition-colors shadow-2xs"
        >
          Replace All
        </button>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 active:bg-slate-200 hover:bg-slate-200/60 rounded-md ml-1"
          aria-label="Close find and replace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
