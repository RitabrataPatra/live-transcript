import React from 'react';
import { Language } from '../types';
import { POPULAR_LANGUAGE_CODES, getLanguageByCode } from '../constants/languages';
import { Mic, ChevronDown, History, Plus, Sparkles, Volume2 } from 'lucide-react';

interface HeaderProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenLanguageModal: () => void;
  onOpenHistory: () => void;
  onNewSession: () => void;
  savedCount: number;
  isListening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onOpenLanguageModal,
  onOpenHistory,
  onNewSession,
  savedCount,
  isListening,
}) => {
  const popularLanguages = POPULAR_LANGUAGE_CODES.map((code) => getLanguageByCode(code));
  const isSelectedInPopular = popularLanguages.some((l) => l.code === selectedLanguage.code);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Transcribe<span className="text-blue-600">Live</span>
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/60 rounded-md">
                Google Translate Style
              </span>
            </div>
          </div>
        </div>

        {/* Center / Popular Language Tabs on Desktop */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-xl">
          {popularLanguages.slice(0, 6).map((lang) => {
            const isCurrent = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name.split(' ')[0]}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenLanguageModal}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              !isSelectedInPopular
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Browse all 40+ supported languages"
          >
            <span>{!isSelectedInPopular ? `${selectedLanguage.flag} ${selectedLanguage.name}` : 'More'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Language Button */}
          <button
            onClick={onOpenLanguageModal}
            className="lg:hidden flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200 max-w-[130px] sm:max-w-none"
            title="Switch spoken language"
            aria-label={`Language: ${selectedLanguage.name}`}
          >
            <span className="text-sm shrink-0">{selectedLanguage.flag}</span>
            <span className="truncate">{selectedLanguage.name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={onNewSession}
            className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            title="Start a new transcript session"
            aria-label="New Transcript"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            title="View saved transcript history"
            aria-label="View history"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto px-1.5 py-0.2 text-[10px] font-bold bg-blue-600 text-white rounded-full leading-tight">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
