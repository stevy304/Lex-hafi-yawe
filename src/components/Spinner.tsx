import React from 'react';

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <span className={`spinner ${className}`} aria-hidden="true" />;
};
