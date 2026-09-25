import React, { useState } from 'react';
import { copyToClipboard } from '../utils/exportUtils';
import { X, Copy, Check, Mail, Share2, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transcriptText: string;
  languageName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  transcriptText,
  languageName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(transcriptText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Transcription: ${title}`
  )}&body=${encodeURIComponent(
    `Here is the transcript (${languageName}):\n\n${transcriptText}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Share Transcript</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">{languageName} · {transcriptText.split(/\s+/).filter(Boolean).length} words</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 active:bg-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Transcript Snippet
            </label>
            <div className="max-h-32 sm:max-h-36 overflow-y-auto p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
              {transcriptText.length > 500
                ? `${transcriptText.slice(0, 500)}...`
                : transcriptText}
            </div>
          </div>

          {/* Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 rounded-xl border border-blue-200 font-medium text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Text</span>
                </>
              )}
            </button>

            <a
              href={mailtoUrl}
              className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl border border-slate-200 font-medium text-xs transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Share via Email</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
