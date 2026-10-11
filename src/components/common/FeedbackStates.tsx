import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`p-4 space-y-3 max-w-[680px] w-full mx-auto ${className}`}
      aria-label={label}
      role="status"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-[12px] bg-[var(--surface)] border border-[var(--border)] p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--hover)] shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 bg-[var(--hover)] rounded-md w-1/3" />
              <div className="h-2.5 bg-[var(--hover)] rounded-md w-1/4" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 bg-[var(--hover)] rounded-md w-full" />
            <div className="h-3 bg-[var(--hover)] rounded-md w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description = "An error occurred while loading this section. Please try again.",
  retryLabel = "Try again",
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-[360px] mx-auto my-12 select-none ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--danger)]">
        <AlertCircle className="w-6 h-6 text-[var(--danger)]" />
      </div>
      <h3 className="text-[16px] font-medium text-[var(--text)] mb-1 leading-snug">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[var(--muted)] mb-4 leading-normal">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] font-medium text-[13px] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
