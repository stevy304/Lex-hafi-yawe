import React, { useState } from 'react';
import { MessageSquare, Heart, Bookmark, Share2 } from 'lucide-react';
import { formatCount } from '../feed/lib/formatCount';

interface PostActionsProps {
  postId: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onCommentClick: () => void;
  onLikeToggle: () => Promise<void>;
  onBookmarkToggle: () => Promise<void>;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  likesCount,
  repliesCount,
  isLiked = false,
  isBookmarked = false,
  onCommentClick,
  onLikeToggle,
  onBookmarkToggle,
}) => {
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    const shareData = {
      title: 'Lex Hafi Yawe Post',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-[28px] mt-2 select-none">
      {/* Comment action */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick();
        }}
        aria-label={`${repliesCount} comments`}
        className="group flex items-center gap-1.5 h-[36px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer active:scale-97"
      >
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center group-hover:bg-[var(--hover)] transition-colors">
          <MessageSquare className="w-[18px] h-[18px]" />
        </div>
        <span className="text-[13px]">{formatCount(repliesCount)}</span>
      </button>

      {/* Like action */}
      <button
        type="button"
        aria-pressed={isLiked}
        onClick={(e) => {
          e.stopPropagation();
          onLikeToggle();
        }}
        aria-label={`${likesCount} likes`}
        className={`group flex items-center gap-1.5 h-[36px] transition-colors cursor-pointer active:scale-97 ${
          isLiked ? 'text-[var(--like)]' : 'text-[var(--muted)] hover:text-[var(--like)]'
        }`}
      >
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center group-hover:bg-[var(--hover)] transition-colors">
          <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-current' : ''}`} />
        </div>
        <span className="text-[13px]">{formatCount(likesCount)}</span>
      </button>

      {/* Bookmark action */}
      <button
        type="button"
        aria-pressed={isBookmarked}
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkToggle();
        }}
        aria-label="Bookmark post"
        className={`group flex items-center gap-1.5 h-[36px] transition-colors cursor-pointer active:scale-97 ${
          isBookmarked ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--accent)]'
        }`}
      >
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center group-hover:bg-[var(--hover)] transition-colors">
          <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-current' : ''}`} />
        </div>
      </button>

      {/* Share action */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share post"
        className="group relative flex items-center gap-1.5 h-[36px] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer active:scale-97"
      >
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center group-hover:bg-[var(--hover)] transition-colors">
          <Share2 className="w-[18px] h-[18px]" />
        </div>
        {shareSuccess && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text)] whitespace-nowrap shadow-xs">
            Link copied
          </span>
        )}
      </button>
    </div>
  );
};
