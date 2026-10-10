import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';

interface ProfileHoverCardProps {
  user: User;
  children: React.ReactNode;
  onFollowToggle?: (userId: string) => void;
  isFollowing?: boolean;
}

export const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({
  user,
  children,
  onFollowToggle,
  isFollowing = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // Check if device supports hover
    if (window.matchMedia('(hover: hover)').matches) {
      timeoutRef.current = window.setTimeout(() => {
        setIsOpen(true);
      }, 400);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {children}

      {isOpen && (
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-2 z-50 w-64 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl text-left select-none animate-in fade-in duration-150"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center font-bold text-sm">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            {onFollowToggle && (
              <button
                type="button"
                onClick={() => onFollowToggle(user.id)}
                className={`px-3 py-1 text-[12px] font-semibold rounded-full transition-colors cursor-pointer ${
                  isFollowing
                    ? 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--danger)] hover:text-[var(--danger)]'
                    : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="space-y-0.5 mb-2">
            <div className="flex items-center gap-1 font-semibold text-[14px] text-[var(--text)]">
              <span>{user.name}</span>
              {user.isVerified && (
                <span className="text-[var(--gold)] text-xs" title="Verified advocate">
                  ✓
                </span>
              )}
            </div>
            <div className="text-[12px] text-[var(--muted)]">@{user.username}</div>
          </div>

          {user.bio && (
            <p className="text-[12px] text-[var(--muted)] line-clamp-3 leading-snug mb-2">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-3 text-[12px] text-[var(--muted)] pt-1 border-t border-[var(--border)]">
            <span>
              <strong className="text-[var(--text)]">{user.followingCount || 0}</strong> Following
            </span>
            <span>
              <strong className="text-[var(--text)]">{user.followersCount || 0}</strong> Followers
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
