import React from 'react';
import { ConfidentialMatch } from './confidential';

interface ConfidentialOverlayProps {
  text: string;
  matches: ConfidentialMatch[];
}

export const ConfidentialOverlay: React.FC<ConfidentialOverlayProps> = ({ text, matches }) => {
  if (!matches || matches.length === 0) return null;

  // Render text with matches wrapped in <mark>
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.start > lastIndex) {
      parts.push(text.slice(lastIndex, match.start));
    }

    parts.push(
      <mark
        key={`match-${i}`}
        className="bg-[var(--warn-bg)] text-[var(--warn-text)] rounded-[2px] px-0.5"
      >
        {text.slice(match.start, match.end)}
      </mark>
    );

    lastIndex = match.end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-[15px] leading-[1.55] text-transparent select-none p-0 m-0 overflow-hidden"
      style={{
        fontFamily: 'inherit',
      }}
    >
      {parts}
    </div>
  );
};
