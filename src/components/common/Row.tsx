import React from 'react';

export interface RowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  dense?: boolean;
}

export const Row: React.FC<RowProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className = '',
  dense = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex items-center gap-3 px-4 transition-colors ${
        dense ? 'min-h-[48px] py-2' : 'min-h-[56px] py-3'
      } ${
        onClick ? 'hover:bg-[var(--hover)] cursor-pointer select-none' : ''
      } ${className}`}
      {...props}
    >
      {leading && (
        <div className="shrink-0 flex items-center justify-center">
          {leading}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-[var(--text)] truncate leading-snug">
          {title}
        </div>
        {subtitle && (
          <div className="text-[13px] text-[var(--muted)] truncate mt-0.5 leading-snug">
            {subtitle}
          </div>
        )}
      </div>

      {trailing && (
        <div className="shrink-0 flex items-center gap-2">
          {trailing}
        </div>
      )}
    </div>
  );
};
