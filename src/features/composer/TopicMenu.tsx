import React, { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown } from 'lucide-react';

const TOPIC_OPTIONS = [
  'General legal',
  'Land and property',
  'Labor and employment',
  'Commercial and companies',
  'Family and succession',
  'Criminal justice',
  'Dispute resolution',
  'Data protection',
  'Courts and e-filing',
];

interface TopicMenuProps {
  value: string;
  onChange: (topic: string) => void;
  topicLabels?: Record<string, string>;
}

export const TopicMenu: React.FC<TopicMenuProps> = ({ value, onChange, topicLabels = {} }) => {
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

  const displayLabel = topicLabels[value] || value;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--border)] text-[12px] text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <Tag className="w-3 h-3 text-[var(--muted)]" />
        <span className="truncate max-w-[140px]">{displayLabel}</span>
        <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 mt-1 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg z-50 py-1 max-h-56 overflow-y-auto no-scrollbar"
        >
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = value === topic;
            const label = topicLabels[topic] || topic;
            return (
              <button
                key={topic}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(topic);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] hover:bg-[var(--hover)] cursor-pointer ${
                  isSelected ? 'text-[var(--accent)] font-medium' : 'text-[var(--text)]'
                }`}
              >
                <span>{label}</span>
                {isSelected && <span className="text-[var(--accent)]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
