import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K / Ctrl K', description: 'Open Quick Command Palette (Laws, Counsel, Actions)' },
    { key: 'J', description: 'Navigate down to the next feed post' },
    { key: 'K', description: 'Navigate up to the previous feed post' },
    { key: 'L', description: 'Like or react to the focused post' },
    { key: 'C', description: 'Focus comments and reply composer' },
    { key: 'M', description: 'Toggle video mute / un-mute globally' },
    { key: 'Space', description: 'Play / pause active video' },
    { key: 'Esc', description: 'Close modals, lightboxes, or full-screen viewers' },
    { key: '?', description: 'Show this keyboard shortcuts guide' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-slate-100 text-xs">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-700 font-medium">{sc.description}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-2xs font-mono font-bold text-slate-800 shadow-2xs whitespace-nowrap">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-2xs text-slate-500">
          Press <kbd className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">ESC</kbd> to return to feed.
        </div>
      </div>
    </div>
  );
};
