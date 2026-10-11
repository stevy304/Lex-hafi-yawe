import React from 'react';
import { ShieldCheck, Award, HeartHandshake } from 'lucide-react';
import { User } from '../../types';

interface VerificationBadgeProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  user,
  size = 'md',
  showLabel = false,
}) => {
  if (!user || !user.isVerified) return null;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (user.verificationType === 'bar_member' || user.role === 'advocate') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[var(--gold)] cursor-help"
        title={`Verified Advocate - Rwanda Bar Association (${user.barRollNumber || 'Active Roll'})`}
      >
        <span className="p-0.5 rounded-full bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)] inline-flex items-center justify-center">
          <ShieldCheck className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-[12px] font-medium text-[var(--gold)]">Advocate (RBA)</span>
        )}
      </span>
    );
  }

  if (user.verificationType === 'official_institution' || user.role === 'institution') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[var(--gold)] cursor-help"
        title="Verified Official Institution / Statutory Body (Republic of Rwanda)"
      >
        <span className="p-0.5 rounded-full bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)] inline-flex items-center justify-center">
          <Award className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-[12px] font-medium text-[var(--gold)]">Official institution</span>
        )}
      </span>
    );
  }

  if (user.verificationType === 'legal_aid_bureau' || user.role === 'legalaid') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[var(--ok-text)] cursor-help"
        title="Accredited Legal Aid Provider - Ministry of Justice (MAJ)"
      >
        <span className="p-0.5 rounded-full bg-[var(--ok-bg)] text-[var(--ok-text)] inline-flex items-center justify-center">
          <HeartHandshake className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-[12px] font-medium text-[var(--ok-text)]">Legal aid bureau</span>
        )}
      </span>
    );
  }

  return (
    <span className="p-0.5 rounded-full bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)] inline-flex items-center justify-center">
      <ShieldCheck className={iconSizes[size]} />
    </span>
  );
};
