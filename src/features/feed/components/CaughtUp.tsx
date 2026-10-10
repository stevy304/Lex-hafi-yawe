import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CaughtUpProps {
  onExploreClick?: () => void;
  title?: string;
  actionLabel?: string;
}

export const CaughtUp: React.FC<CaughtUpProps> = ({
  onExploreClick,
  title = "You're all caught up",
  actionLabel = 'Explore topics',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-t border-[var(--border)]">
      <div className="w-9 h-9 rounded-full bg-[var(--ok-bg)] text-[var(--ok-text)] flex items-center justify-center mb-2">
        <Check className="w-4 h-4 stroke-[2.5]" />
      </div>
      <h4 className="text-[14px] font-medium text-[var(--text)] mb-1">{title}</h4>
      <Link
        to="/explore"
        onClick={onExploreClick}
        className="text-[13px] text-[var(--accent)] hover:underline font-medium"
      >
        {actionLabel}
      </Link>
    </div>
  );
};
