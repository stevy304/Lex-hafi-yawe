import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Post, User, PostCitation } from '../../../types';
import { PostRow } from '../../post/PostRow';
import { FeedSkeleton } from './FeedSkeleton';
import { FeedError } from './FeedError';
import { CaughtUp } from './CaughtUp';

interface FeedListProps {
  posts: Post[];
  users: User[];
  currentUser: User | null;
  containerRef: React.RefObject<HTMLElement | null>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isNextPageError: boolean;
  onFetchNextPage: () => void;
  onRetryNextPage: () => void;
  onPostClick?: (postId: string) => void;
  onAuthorClick?: (userId: string) => void;
  onTopicClick?: (topic: string) => void;
  onCitationClick?: (citation: PostCitation) => void;
  onLikeToggle?: (postId: string) => Promise<void>;
  onBookmarkToggle?: (postId: string) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onNotInterested?: (postId: string, topic?: string) => Promise<void>;
  onReportPost?: (postId: string, reason: string, details?: string) => Promise<void>;
  isForYouTab?: boolean;
  optimisticNewPostId?: string;
}

export const FeedList: React.FC<FeedListProps> = ({
  posts,
  users,
  currentUser,
  containerRef,
  isFetchingNextPage,
  hasNextPage,
  isNextPageError,
  onFetchNextPage,
  onRetryNextPage,
  onPostClick,
  onAuthorClick,
  onTopicClick,
  onCitationClick,
  onLikeToggle,
  onBookmarkToggle,
  onDeletePost,
  onNotInterested,
  onReportPost,
  isForYouTab = false,
  optimisticNewPostId,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const userMap = useRef(new Map<string, User>());

  // Cache user lookups
  useEffect(() => {
    userMap.current.clear();
    users.forEach((u) => userMap.current.set(u.id, u));
  }, [users]);

  const getAuthor = (authorId: string): User => {
    return (
      userMap.current.get(authorId) || {
        id: authorId,
        name: 'Lex Member',
        username: 'user',
        role: 'citizen' as const,
        isVerified: false,
        bio: '',
        location: 'Kigali, Rwanda',
        languages: ['English', 'Kinyarwanda'],
        joinedDate: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      }
    );
  };

  // IntersectionObserver for infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isNextPageError) {
          onFetchNextPage();
        }
      },
      {
        root: containerRef.current || null,
        rootMargin: '0px 0px 1200px 0px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [containerRef, hasNextPage, isFetchingNextPage, isNextPageError, onFetchNextPage]);

  // Virtualizer when posts > 100
  const isVirtual = posts.length > 100;
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 220,
    overscan: 6,
  });

  return (
    <div
      role="feed"
      aria-busy={isFetchingNextPage}
      className="w-full relative"
      style={{ overflowAnchor: 'auto' }}
    >
      {isVirtual ? (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const post = posts[virtualRow.index];
            const author = getAuthor(post.authorId);
            return (
              <div
                key={post.id}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <PostRow
                  post={post}
                  author={author}
                  currentUser={currentUser}
                  posInSet={virtualRow.index + 1}
                  isForYouTab={isForYouTab}
                  onPostClick={onPostClick}
                  onAuthorClick={onAuthorClick}
                  onTopicClick={onTopicClick}
                  onCitationClick={onCitationClick}
                  onLikeToggle={onLikeToggle}
                  onBookmarkToggle={onBookmarkToggle}
                  onDeletePost={onDeletePost}
                  onNotInterested={onNotInterested}
                  onReportPost={onReportPost}
                  highlighted={post.id === optimisticNewPostId}
                />
              </div>
            );
          })}
        </div>
      ) : (
        posts.map((post, index) => {
          const author = getAuthor(post.authorId);
          return (
            <PostRow
              key={post.id}
              post={post}
              author={author}
              currentUser={currentUser}
              posInSet={index + 1}
              isForYouTab={isForYouTab}
              onPostClick={onPostClick}
              onAuthorClick={onAuthorClick}
              onTopicClick={onTopicClick}
              onCitationClick={onCitationClick}
              onLikeToggle={onLikeToggle}
              onBookmarkToggle={onBookmarkToggle}
              onDeletePost={onDeletePost}
              onNotInterested={onNotInterested}
              onReportPost={onReportPost}
              highlighted={post.id === optimisticNewPostId}
            />
          );
        })
      )}

      {/* Sentinel for infinite scrolling */}
      <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

      {/* Loading sentinel state: 1 skeleton row while loading */}
      {isFetchingNextPage && <FeedSkeleton count={1} />}

      {/* Error state on next page failure */}
      {isNextPageError && <FeedError isInline onRetry={onRetryNextPage} />}

      {/* Caught up end of feed */}
      {!hasNextPage && posts.length > 0 && <CaughtUp />}
    </div>
  );
};
