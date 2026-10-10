import React, { useRef, useState, useEffect } from 'react';
import { CheckBadge, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export const TOPICS = [
  'All topics',
  'Land and property',
  'Labor and employment',
  'Commercial and companies',
  'Family and succession',
  'Criminal justice',
  'Dispute resolution',
  'Data protection',
  'Courts and e-filing',
] as const;

interface ChipBarProps {
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: () => void;
  mediaOnly: boolean;
  onToggleMediaOnly: () => void;
  hideOnScroll?: boolean; // transformed behind TabBar
  topicLabels?: Record<string, string>;
  verifiedLabel?: string;
  mediaLabel?: string;
}

export const ChipBar: React.FC<ChipBarProps> = ({
  selectedTopic,
  onSelectTopic,
  verifiedOnly,
  onToggleVerifiedOnly,
  mediaOnly,
  onToggleMediaOnly,
  hideOnScroll = false,
  topicLabels = {},
  verifiedLabel = 'Verified only',
  mediaLabel = 'With media',
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollByAmount = (amount: number) => {
    rowRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`sticky top-[48px] z-20 w-full bg-[var(--bg)] border-b border-[var(--border)] transition-transform duration-200 ease-out select-none ${
        hideOnScroll ? '-translate-y-[calc(100%+1px)]' : 'translate-y-0'
      }`}
      style={{ height: 44 }}
    >
      <div className="relative flex items-center h-full px-3">
        {/* Left Scroll Arrow */}
        {isHovered && canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-200)}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-2 z-10 w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] items-center justify-center cursor-pointer shadow-sm hover:bg-[var(--hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontally scrollable chip row */}
        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full h-full py-[8px]"
        >
          {TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            const displayLabel = topicLabels[topic] || topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onSelectTopic(topic)}
                className={`shrink-0 h-[28px] px-3 rounded-full text-[13px] font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                    : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}

          {/* Divider between topics and toggles */}
          <div className="w-[1px] h-4 bg-[var(--border)] shrink-0 mx-0.5" />

          {/* Verified Only Toggle */}
          <button
            type="button"
            aria-pressed={verifiedOnly}
            onClick={onToggleVerifiedOnly}
            className={`shrink-0 h-[28px] px-2.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]'
            }`}
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center text-[var(--gold)]">✓</span>
            <span>{verifiedLabel}</span>
          </button>

          {/* With Media Toggle */}
          <button
            type="button"
            aria-pressed={mediaOnly}
            onClick={onToggleMediaOnly}
            className={`shrink-0 h-[28px] px-2.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
              mediaOnly
                ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{mediaLabel}</span>
          </button>
        </div>

        {/* Right Scroll Arrow */}
        {isHovered && canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(200)}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-2 z-10 w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] items-center justify-center cursor-pointer shadow-sm hover:bg-[var(--hover)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
