import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-[12px] bg-[var(--surface)] border border-[var(--border)] p-4 transition-colors ${
        interactive ? 'hover:bg-[var(--hover)] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
