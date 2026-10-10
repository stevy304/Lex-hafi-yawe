import React from 'react';
import { BookOpen } from 'lucide-react';
import { PostCitation } from '../../types';

interface LawCitationCardProps {
  citations: PostCitation[];
  onCitationClick?: (citation: PostCitation) => void;
}

export const LawCitationCard: React.FC<LawCitationCardProps> = ({
  citations,
  onCitationClick,
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5">
      {citations.map((c, idx) => {
        const text = `${c.number || c.title}${c.article ? `, ${c.article}` : ''}`;
        return (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onCitationClick?.(c);
            }}
            className="flex items-center gap-2.5 p-[8px_12px] bg-[var(--surface)] border border-[var(--border)] border-l-[3px] border-l-[var(--gold)] rounded-r-[8px] text-[13px] hover:bg-[var(--hover)] transition-colors cursor-pointer select-none"
          >
            <BookOpen className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <span className="font-medium text-[var(--text)]">{text}</span>
          </div>
        );
      })}
    </div>
  );
};
