import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, ChevronDown } from 'lucide-react';

interface VisibilityMenuProps {
  value: 'public' | 'followers';
  onChange: (val: 'public' | 'followers') => void;
  publicLabel?: string;
  followersLabel?: string;
}

export const VisibilityMenu: React.FC<VisibilityMenuProps> = ({
  value,
  onChange,
  publicLabel = 'Public',
  followersLabel = 'Followers only',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentIcon = value === 'public' ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />;
  const currentText = value === 'public' ? publicLabel : followersLabel;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--border)] text-[12px] text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        {currentIcon}
        <span>{currentText}</span>
        <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 mt-1 w-44 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg z-50 py-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange('public');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-[var(--hover)] cursor-pointer ${
              value === 'public' ? 'text-[var(--accent)] font-medium' : 'text-[var(--text)]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{publicLabel}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange('followers');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-[var(--hover)] cursor-pointer ${
              value === 'followers' ? 'text-[var(--accent)] font-medium' : 'text-[var(--text)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{followersLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
