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
  showLabel = false
}) => {
  if (!user || !user.isVerified) return null;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (user.verificationType === 'bar_member' || user.role === 'advocate') {
    return (
      <span
        className="inline-flex items-center gap-1 text-blue-600 cursor-help"
        title={`Verified Advocate - Rwanda Bar Association (${user.barRollNumber || 'Active Roll'})`}
      >
        <span className="p-0.5 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center">
          <ShieldCheck className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-xs font-semibold text-blue-700">Advocate (RBA)</span>
        )}
      </span>
    );
  }

  if (user.verificationType === 'official_institution' || user.role === 'institution') {
    return (
      <span
        className="inline-flex items-center gap-1 text-amber-600 cursor-help"
        title="Verified Official Institution / Statutory Body (Republic of Rwanda)"
      >
        <span className="p-0.5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center">
          <Award className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-xs font-semibold text-amber-800">Official Institution</span>
        )}
      </span>
    );
  }

  if (user.verificationType === 'legal_aid_bureau' || user.role === 'legalaid') {
    return (
      <span
        className="inline-flex items-center gap-1 text-emerald-600 cursor-help"
        title="Accredited Legal Aid Provider - Ministry of Justice (MAJ)"
      >
        <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
          <HeartHandshake className={iconSizes[size]} />
        </span>
        {showLabel && (
          <span className="text-xs font-semibold text-emerald-700">Legal Aid Bureau</span>
        )}
      </span>
    );
  }

  return (
    <span className="p-0.5 rounded-full bg-blue-50 text-blue-600 inline-flex items-center justify-center">
      <ShieldCheck className={iconSizes[size]} />
    </span>
  );
};
