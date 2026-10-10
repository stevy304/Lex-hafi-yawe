import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'j', label: 'Next post' },
  { key: 'k', label: 'Previous post' },
  { key: 'l', label: 'Like / unlike current post' },
  { key: 'b', label: 'Bookmark / remove bookmark' },
  { key: 'c', label: 'Open comments for current post' },
  { key: 'n', label: 'Open post composer' },
  { key: '/', label: 'Focus search' },
  { key: '.', label: 'Jump to new posts' },
  { key: '?', label: 'Open keyboard shortcuts dialog' },
  { key: 'Esc', label: 'Close dialog or collapse draft' },
];

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeBtnRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <h2 id="shortcuts-title" className="text-[16px] font-semibold text-[var(--text)]">
            Keyboard shortcuts
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-[13px] py-1">
              <span className="text-[var(--text)]">{s.label}</span>
              <kbd className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] font-mono text-[12px] font-semibold text-[var(--muted)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[var(--border)] text-[12px] text-[var(--muted)] text-center">
          Shortcuts are disabled while typing in text fields.
        </div>
      </div>
    </div>
  );
};
