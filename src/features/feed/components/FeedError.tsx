import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FeedErrorProps {
  isInline?: boolean;
  onRetry: () => void;
  title?: string;
  description?: string;
  retryLabel?: string;
}

export const FeedError: React.FC<FeedErrorProps> = ({
  isInline = false,
  onRetry,
  title = "Couldn't load posts",
  description = 'Check your connection. Cached posts stay visible.',
  retryLabel = 'Try again',
}) => {
  if (isInline) {
    return (
      <div className="flex items-center justify-between p-3.5 mx-4 my-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[13px]">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
          <span>Couldn't load more posts</span>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="text-[var(--accent)] hover:underline font-medium cursor-pointer"
        >
          {retryLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-[360px] mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-[var(--danger)]" />
      </div>
      <h3 className="text-[16px] font-medium text-[var(--text)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--muted)] mb-4 leading-normal">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] font-medium text-[13px] transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{retryLabel}</span>
      </button>
    </div>
  );
};
