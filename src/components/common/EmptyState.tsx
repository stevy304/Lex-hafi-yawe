import React from 'react';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-[420px] mx-auto my-12 select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-3 text-[var(--accent)]">
        {icon || <Sparkles className="w-6 h-6 text-[var(--accent)]" />}
      </div>
      <h3 className="text-[16px] font-medium text-[var(--text)] mb-1 leading-snug">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[var(--muted)] mb-4 leading-normal">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-medium text-[13px] transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
