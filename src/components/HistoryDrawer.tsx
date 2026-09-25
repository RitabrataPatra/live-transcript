import React, { useState, useMemo } from 'react';
import { SavedTranscript } from '../types';
import { formatDuration, exportTranscript } from '../utils/exportUtils';
import {
  X,
  Search,
  Download,
  Trash2,
  Edit2,
  Clock,
  ArrowRight,
  FileText,
  Check,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTranscripts: SavedTranscript[];
  onLoadTranscript: (item: SavedTranscript) => void;
  onDeleteTranscript: (id: string) => void;
  onRenameTranscript: (id: string, newTitle: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedTranscripts,
  onLoadTranscript,
  onDeleteTranscript,
  onRenameTranscript,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredTranscripts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savedTranscripts;
    return savedTranscripts.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.languageName.toLowerCase().includes(q)
    );
  }, [savedTranscripts, searchQuery]);

  if (!isOpen) return null;

  const handleStartRename = (item: SavedTranscript, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameTranscript(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Saved Transcripts</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {savedTranscripts.length} session{savedTranscripts.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 active:bg-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript history..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          {filteredTranscripts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm font-medium text-slate-600 mb-1">No transcripts found</p>
              <p className="text-xs">
                {searchQuery
                  ? 'Try searching with a different term.'
                  : 'Your recorded transcripts will automatically be saved here.'}
              </p>
            </div>
          ) : (
            filteredTranscripts.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onLoadTranscript(item);
                  onClose();
                }}
                className="group p-3 sm:p-4 bg-white border border-slate-200 hover:border-blue-400 active:bg-slate-50 hover:shadow-xs rounded-xl cursor-pointer transition-all"
              >
                {/* Title & Editing */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {editingId === item.id ? (
                    <div
                      className="flex items-center gap-1.5 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-blue-400 rounded focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveRename(item.id, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 flex-1">
                      {item.title}
                    </h3>
                  )}

                  <div
                    className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleStartRename(item, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 active:bg-slate-200 rounded hover:bg-slate-100"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportTranscript(item, 'txt');
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 active:bg-blue-50 rounded hover:bg-slate-100"
                      title="Download as .txt"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTranscript(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 active:bg-red-50 rounded hover:bg-slate-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-normal leading-relaxed">
                  {item.text || '(Empty transcript)'}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-medium text-slate-600">{item.languageName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.wordCount} words</span>
                  </div>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedTranscripts.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 active:underline font-medium transition-colors"
            >
              Clear All History
            </button>
            <span className="text-slate-400 text-[11px]">Stored in browser</span>
          </div>
        )}
      </div>
    </div>
  );
};
