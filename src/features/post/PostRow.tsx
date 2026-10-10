import React, { useState } from 'react';
import { Post, User, PostCitation } from '../../types';
import { PostHeader } from './PostHeader';
import { PostBody } from './PostBody';
import { PostMedia } from './PostMedia';
import { PostDocuments } from './PostDocuments';
import { LawCitationCard } from './LawCitationCard';
import { PostActions } from './PostActions';
import { PostMenu } from './PostMenu';
import { ReportDialog } from './ReportDialog';
import { ProfileHoverCard } from './ProfileHoverCard';

interface PostRowProps {
  post: Post;
  author: User;
  currentUser: User | null;
  posInSet?: number;
  isForYouTab?: boolean;
  onPostClick?: (postId: string) => void;
  onAuthorClick?: (userId: string) => void;
  onTopicClick?: (topic: string) => void;
  onCitationClick?: (citation: PostCitation) => void;
  onLikeToggle?: (postId: string) => Promise<void>;
  onBookmarkToggle?: (postId: string) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onNotInterested?: (postId: string, topic?: string) => Promise<void>;
  onReportPost?: (postId: string, reason: string, details?: string) => Promise<void>;
  isSending?: boolean;
  isFailed?: boolean;
  onRetrySend?: () => void;
  onDiscardSend?: () => void;
  highlighted?: boolean;
}

export const PostRow: React.FC<PostRowProps> = ({
  post,
  author,
  currentUser,
  posInSet = 1,
  isForYouTab = false,
  onPostClick,
  onAuthorClick,
  onTopicClick,
  onCitationClick,
  onLikeToggle,
  onBookmarkToggle,
  onDeletePost,
  onNotInterested,
  onReportPost,
  isSending = false,
  isFailed = false,
  onRetrySend,
  onDiscardSend,
  highlighted = false,
}) => {
  const [isLiked, setIsLiked] = useState(() => post.likedBy?.includes(currentUser?.id || '') || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(() => post.bookmarkedBy?.includes(currentUser?.id || '') || false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwnPost = currentUser?.id === post.authorId;

  const handleLike = async () => {
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (onLikeToggle) {
      try {
        await onLikeToggle(post.id);
      } catch {
        // Rollback
        setIsLiked(!nextLiked);
        setLikesCount(likesCount);
      }
    }
  };

  const handleBookmark = async () => {
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    if (onBookmarkToggle) {
      try {
        await onBookmarkToggle(post.id);
      } catch {
        setIsBookmarked(!nextBookmarked);
      }
    }
  };

  const handleRowClick = () => {
    if (!isSending && !isFailed) {
      onPostClick?.(post.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Don't trigger if focus is on child button or link
      if ((e.target as HTMLElement).tagName === 'ARTICLE') {
        e.preventDefault();
        handleRowClick();
      }
    }
  };

  // Convert legacy attachments to media or documents if needed
  const mediaItems =
    post.media && post.media.length > 0
      ? post.media
      : post.attachments?.filter((a) => a.type === 'image' || a.type === 'video').map((a) => ({
          url: a.url,
          alt: (a as any).alt || a.name,
        })) || [];

  const documentItems =
    post.documents && post.documents.length > 0
      ? post.documents
      : post.attachments?.filter((a) => a.type === 'document').map((a, idx) => ({
          id: `doc_${idx}`,
          name: a.name,
          size: a.fileSize ? 1024 * 1024 : 1024,
          url: a.url,
        })) || [];

  return (
    <>
      <article
        data-feed-post-id={post.id}
        tabIndex={0}
        aria-labelledby={`post-header-${post.id}`}
        aria-posinset={posInSet}
        aria-setsize={-1}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        className={`grid grid-cols-[40px_minmax(0,1fr)] gap-3 p-[14px_16px] border-b border-[var(--border)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px] ${
          highlighted ? 'bg-[rgba(210,105,30,0.12)] duration-1000' : 'hover:bg-[var(--hover)]'
        } ${isSending ? 'opacity-60 pointer-events-none' : ''} ${isFailed ? 'border-[var(--danger)]' : ''}`}
        style={{ scrollMarginTop: 108 }}
      >
        {/* Left Column: 40px Avatar */}
        <div className="shrink-0 pt-0.5">
          <ProfileHoverCard user={author}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick?.(author.id);
              }}
              aria-label={`View profile of ${author.name}`}
              className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--text)] cursor-pointer hover:opacity-90 transition-opacity"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{author.name?.slice(0, 2).toUpperCase() || 'LX'}</span>
              )}
            </button>
          </ProfileHoverCard>
        </div>

        {/* Right Column: Post Body and Metadata */}
        <div className="min-w-0 flex flex-col justify-between">
          <div>
            <div id={`post-header-${post.id}`} className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <PostHeader
                  author={author}
                  createdAt={post.createdAt}
                  legalTopic={post.legalTopic}
                  isOfficialAnnouncement={post.isOfficialAnnouncement}
                  onAuthorClick={() => onAuthorClick?.(author.id)}
                  onTopicClick={() => onTopicClick?.(post.legalTopic || '')}
                />
              </div>

              {/* Overflow Menu */}
              {!isSending && !isFailed && (
                <PostMenu
                  postId={post.id}
                  authorHandle={author.username}
                  topic={post.legalTopic}
                  isOwnPost={isOwnPost}
                  isForYouTab={isForYouTab}
                  onCopyLink={() => {
                    navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`);
                  }}
                  onNotInterested={() => onNotInterested?.(post.id, post.legalTopic)}
                  onReportClick={() => setIsReportOpen(true)}
                  onDeleteClick={() => setShowDeleteConfirm(true)}
                />
              )}
            </div>

            {/* Post Content */}
            <PostBody
              postId={post.id}
              content={post.content}
              lang={post.lang}
              onNavigate={(href) => {
                if (href.startsWith('/search')) onTopicClick?.(href.split('=')[1] || '');
                else if (href.startsWith('/u/')) onAuthorClick?.(author.id);
              }}
            />

            {/* Media Items */}
            <PostMedia media={mediaItems} />

            {/* Documents */}
            <PostDocuments documents={documentItems} />

            {/* Law Citation Cards */}
            {post.citations && post.citations.length > 0 && (
              <LawCitationCard
                citations={post.citations}
                onCitationClick={(cit) => onCitationClick?.(cit)}
              />
            )}
          </div>

          {/* Failed to send state */}
          {isFailed ? (
            <div className="flex items-center justify-between pt-2 mt-2 text-[12px] text-[var(--danger)]">
              <span>Failed to send post.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetrySend?.();
                  }}
                  className="font-medium hover:underline cursor-pointer"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscardSend?.();
                  }}
                  className="text-[var(--muted)] hover:underline cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          ) : isSending ? (
            <div className="pt-2 text-[12px] text-[var(--muted)] font-medium">
              Posting...
            </div>
          ) : (
            /* Action Bar (Comment, Like, Bookmark, Share) */
            <PostActions
              postId={post.id}
              likesCount={likesCount}
              repliesCount={post.repliesCount || 0}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              onCommentClick={() => onPostClick?.(post.id)}
              onLikeToggle={handleLike}
              onBookmarkToggle={handleBookmark}
            />
          )}
        </div>
      </article>

      {/* Report dialog */}
      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={(reason, details) =>
          onReportPost ? onReportPost(post.id, reason, details) : Promise.resolve()
        }
      />

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl space-y-3 text-center"
          >
            <h4 className="text-[15px] font-semibold text-[var(--text)]">Delete post?</h4>
            <p className="text-[13px] text-[var(--muted)]">
              This action cannot be undone and will permanently remove this post from Lex Hafi Yawe.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-[13px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  onDeletePost?.(post.id);
                }}
                className="px-4 py-2 rounded-lg bg-[var(--danger)] text-white text-[13px] font-medium cursor-pointer hover:brightness-110"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
