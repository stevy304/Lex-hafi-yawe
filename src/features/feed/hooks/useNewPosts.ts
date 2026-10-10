import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '../../../types';

interface UseNewPostsOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  onAutoInsert?: (posts: Post[]) => void;
}

export function useNewPosts({ containerRef, onAutoInsert }: UseNewPostsOptions = {}) {
  const [queuedPosts, setQueuedPosts] = useState<Post[]>([]);
  const isDocumentVisibleRef = useRef<boolean>(true);
  const isInteractingRef = useRef<boolean>(false);
  const interactionTimerRef = useRef<number | null>(null);

  // Track user interaction (mouse move, touch, keydown)
  useEffect(() => {
    const markInteraction = () => {
      isInteractingRef.current = true;
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = window.setTimeout(() => {
        isInteractingRef.current = false;
      }, 2000);
    };

    window.addEventListener('mousemove', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction, { passive: true });
    window.addEventListener('touchstart', markInteraction, { passive: true });

    return () => {
      window.removeEventListener('mousemove', markInteraction);
      window.removeEventListener('keydown', markInteraction);
      window.removeEventListener('touchstart', markInteraction);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, []);

  // Listen to visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Server-Sent Events listener or poll for new posts
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const setupSSE = () => {
      if (!isDocumentVisibleRef.current) return;
      try {
        eventSource = new EventSource('/api/feed/stream');

        eventSource.addEventListener('post:created', (e: MessageEvent) => {
          if (!isDocumentVisibleRef.current) return;
          try {
            const payload = JSON.parse(e.data);
            const newPost: Post = payload.data || payload;

            const getScrollTop = () => {
              if (containerRef?.current) return containerRef.current.scrollTop;
              return window.scrollY || document.documentElement.scrollTop || 0;
            };

            const scrollTop = getScrollTop();

            // If at the top and user not actively typing/clicking, insert quietly
            if (scrollTop < 24 && !isInteractingRef.current && onAutoInsert) {
              onAutoInsert([newPost]);
            } else {
              setQueuedPosts((prev) => {
                if (prev.some((p) => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
            }
          } catch {
            // Ignore parse errors
          }
        });
      } catch {
        // SSE not supported or network error
      }
    };

    setupSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [containerRef, onAutoInsert]);

  const flushNewPosts = useCallback((): Post[] => {
    const postsToInsert = [...queuedPosts];
    setQueuedPosts([]);
    return postsToInsert;
  }, [queuedPosts]);

  return {
    newCount: queuedPosts.length,
    queuedPosts,
    flushNewPosts,
  };
}
