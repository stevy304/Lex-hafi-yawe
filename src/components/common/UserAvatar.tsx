import React from 'react';
import { Scale, Award, HeartHandshake, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface UserAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const getInitials = (name?: string) => {
    if (!name) return 'LX';
    const clean = name.replace(/^Me\.\s+/, '').replace(/\(.*?\)/g, '').trim().split(' ');
    if (clean.length >= 2) {
      return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
    }
    return (clean[0]?.substring(0, 2) || 'LX').toUpperCase();
  };

  // Distinctive palette based on role and name hash
  const getRoleGradient = () => {
    if (!user) {
      return 'from-[#1E293B] via-[#334155] to-[#475569] text-white border-slate-300';
    }
    if (user.role === 'advocate') {
      return 'from-[#102744] via-[#1D4ED8] to-[#1E3A8A] text-white border-blue-300';
    }
    if (user.role === 'institution') {
      return 'from-[#102744] via-[#78350F] to-[#B45309] text-amber-200 border-amber-300';
    }
    if (user.role === 'legalaid') {
      return 'from-[#064E3B] via-[#047857] to-[#0D9488] text-white border-emerald-300';
    }
    if (user.role === 'admin') {
      return 'from-[#1E1B4B] via-[#4338CA] to-[#6366F1] text-white border-indigo-300';
    }
    return 'from-[#1E293B] via-[#334155] to-[#475569] text-white border-slate-300';
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none font-bold tracking-tight bg-gradient-to-br border shadow-xs ${getRoleGradient()} ${sizeClasses[size]} ${className} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      }`}
    >
      <span>{getInitials(user?.name)}</span>
    </div>
  );
};
