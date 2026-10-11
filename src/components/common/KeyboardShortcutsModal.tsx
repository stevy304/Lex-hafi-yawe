import React from 'react';
import { X, Keyboard } from 'lucide-react';

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
    { key: '?', description: 'Show this keyboard shortcuts guide' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--surface)] rounded-[12px] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-[var(--border)] text-[13px]">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-[var(--text)] font-normal">{sc.description}</span>
              <kbd className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded font-mono text-[11px] font-medium text-[var(--muted)] whitespace-nowrap">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[var(--bg)] border-t border-[var(--border)] text-center text-[11px] text-[var(--muted)]">
          Lex Hafi Yawe Rwanda Digital Justice Platform
        </div>
      </div>
    </div>
  );
};
