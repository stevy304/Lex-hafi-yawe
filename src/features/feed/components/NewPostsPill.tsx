import React from 'react';
import { ArrowUp } from 'lucide-react';

interface NewPostsPillProps {
  count: number;
  onClick: () => void;
  chipBarVisible: boolean;
}

export const NewPostsPill: React.FC<NewPostsPillProps> = ({
  count,
  onClick,
  chipBarVisible,
}) => {
  if (count <= 0) return null;

  // Offset updates with ChipBar state:
  // When ChipBar is visible, top is 48 + 44 = 92px.
  // When ChipBar is hidden, top is 48px.
  const topOffset = chipBarVisible ? 'top-[100px]' : 'top-[56px]';

  return (
    <div
      aria-live="polite"
      className={`sticky ${topOffset} z-30 flex justify-center w-full pointer-events-none transition-all duration-200 py-2`}
    >
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[13px] font-medium shadow-md transition-all active:scale-95 cursor-pointer"
      >
        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{count} {count === 1 ? 'new post' : 'new posts'}</span>
      </button>
    </div>
  );
};
