import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../../api/client';
import { Post } from '../../../types';

interface UseInfiniteFeedParams {
  tab: string;
  topic?: string;
  verifiedOnly?: boolean;
  mediaOnly?: boolean;
}

export function useInfiniteFeed({
  tab,
  topic,
  verifiedOnly = false,
  mediaOnly = false,
}: UseInfiniteFeedParams) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [showFilterSkeletons, setShowFilterSkeletons] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isNextPageError, setIsNextPageError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const filterTimeoutRef = useRef<number | null>(null);
  const isFirstMountRef = useRef(true);

  const fetchPage = useCallback(
    async (cursor?: string, isReset = false) => {
      try {
        if (isReset) {
          setIsError(false);
          setIsDimmed(true);
          // If takes longer than 600ms, show 3 skeleton rows
          filterTimeoutRef.current = window.setTimeout(() => {
            setShowFilterSkeletons(true);
          }, 600);
        } else {
          setIsFetchingNextPage(true);
          setIsNextPageError(false);
        }

        const topicParam = topic && topic !== 'All topics' && topic !== 'All Topics' ? topic : undefined;

        const res = await api.getPostsPaginated({
          tab,
          topic: topicParam,
          cursor: cursor || undefined,
          limit: 20,
        });

        let fetchedPosts = res.posts || [];

        // Apply local client filters if backend doesn't support them directly
        if (verifiedOnly) {
          fetchedPosts = fetchedPosts.filter((p) => {
            // Check if author is verified
            const author = (p as any).author;
            return author ? author.isVerified || author.role === 'advocate' || author.role === 'institution' : true;
          });
        }
        if (mediaOnly) {
          fetchedPosts = fetchedPosts.filter((p) => (p.attachments && p.attachments.length > 0) || (p.media && p.media.length > 0));
        }

        if (isReset) {
          setPosts(fetchedPosts);
          setHasNextPage(Boolean(res.hasMore));
          setNextCursor(res.nextCursor || null);
        } else {
          setPosts((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const unique = fetchedPosts.filter((p) => !seen.has(p.id));
            return [...prev, ...unique];
          });
          setHasNextPage(Boolean(res.hasMore));
          setNextCursor(res.nextCursor || null);
        }
      } catch (err) {
        if (isReset) {
          setIsError(true);
        } else {
          setIsNextPageError(true);
        }
      } finally {
        if (filterTimeoutRef.current) {
          clearTimeout(filterTimeoutRef.current);
          filterTimeoutRef.current = null;
        }
        setIsInitialLoading(false);
        setIsDimmed(false);
        setShowFilterSkeletons(false);
        setIsFetchingNextPage(false);
        setIsRefetching(false);
      }
    },
    [tab, topic, verifiedOnly, mediaOnly]
  );

  // Trigger when filters change
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      fetchPage(undefined, true);
    } else {
      fetchPage(undefined, true);
    }
  }, [fetchPage]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage || !nextCursor) return;
    await fetchPage(nextCursor, false);
  }, [fetchPage, isFetchingNextPage, hasNextPage, nextCursor]);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    await fetchPage(undefined, true);
  }, [fetchPage]);

  const insertOptimisticPost = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  return {
    posts,
    setPosts,
    isInitialLoading,
    isFetchingNextPage,
    isDimmed,
    showFilterSkeletons,
    hasNextPage,
    isError,
    isNextPageError,
    isRefetching,
    fetchNextPage,
    refetch,
    insertOptimisticPost,
  };
}
