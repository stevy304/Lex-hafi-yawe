import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions,
  children,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-20 shrink-0 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md px-4 py-3 select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="p-1.5 -ml-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold text-[var(--text)] leading-tight truncate m-0 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-[var(--muted)] truncate mt-0.5 m-0 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </header>
  );
};
