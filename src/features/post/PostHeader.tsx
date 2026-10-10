import React from 'react';
import { User } from '../../types';
import { formatRelativeTime } from '../feed/lib/formatRelativeTime';
import { ProfileHoverCard } from './ProfileHoverCard';

interface PostHeaderProps {
  author: User;
  createdAt: string;
  legalTopic?: string;
  isOfficialAnnouncement?: boolean;
  onAuthorClick?: () => void;
  onTopicClick?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  author,
  createdAt,
  legalTopic,
  isOfficialAnnouncement,
  onAuthorClick,
  onTopicClick,
}) => {
  const { relative, fullKigali, iso } = formatRelativeTime(createdAt);
  const isAdvocate = author.role === 'advocate' || author.isVerified;
  const isOfficial = isOfficialAnnouncement || author.role === 'institution';

  return (
    <div className="flex items-baseline justify-between gap-2 text-[13px] leading-tight flex-wrap">
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <ProfileHoverCard user={author}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick?.();
            }}
            className="flex items-center gap-1 hover:underline cursor-pointer font-medium text-[14px] text-[var(--text)]"
          >
            <span className="truncate max-w-[200px]">{author.name}</span>
          </button>
        </ProfileHoverCard>

        {/* Verified Advocate Rosette Check in Gold */}
        {isAdvocate && (
          <span
            title="Verified advocate"
            aria-label="Verified advocate"
            className="text-[var(--gold)] text-xs select-none"
          >
            ✓
          </span>
        )}

        {/* Official Pill */}
        {isOfficial && (
          <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--ok-bg)] text-[var(--ok-text)] select-none">
            Official
          </span>
        )}

        {/* @handle and time */}
        <span className="text-[var(--muted)]">@{author.username}</span>
        <span className="text-[var(--muted)]">·</span>
        <time
          dateTime={iso}
          title={fullKigali}
          className="text-[var(--muted)] hover:underline cursor-default"
        >
          {relative}
        </time>
      </div>

      {/* Right-aligned topic chip */}
      {legalTopic && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTopicClick?.();
          }}
          className="px-2 py-0.5 rounded-full text-[12px] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer shrink-0 ml-auto"
        >
          {legalTopic}
        </button>
      )}
    </div>
  );
};
