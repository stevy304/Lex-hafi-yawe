import { useLayoutEffect, useEffect } from 'react';
import { makeKey, saveScrollState, getScrollState } from '../lib/restorationStore';
import { Post } from '../../../types';

export function useFeedRestoration(
  containerRef: React.RefObject<HTMLElement | null>,
  currentTab: string,
  selectedTopic: string,
  verifiedOnly: boolean,
  mediaOnly: boolean,
  posts: Post[],
  isInitialLoading: boolean
) {
  const key = makeKey(currentTab, selectedTopic, verifiedOnly, mediaOnly);

  // Restore scroll position after initial load
  useLayoutEffect(() => {
    if (isInitialLoading || posts.length === 0) return;

    const saved = getScrollState(key);
    if (!saved || saved.scrollTop <= 0) return;

    const el = containerRef.current || document.scrollingElement || document.documentElement;
    if (el) {
      el.scrollTop = saved.scrollTop;
    }
  }, [key, isInitialLoading, posts.length, containerRef]);

  // Persist scroll position periodically and on unmount
  useEffect(() => {
    const el = containerRef.current || (typeof window !== 'undefined' ? window : null);
    if (!el) return;

    const handleScroll = () => {
      const scrollY = containerRef.current
        ? containerRef.current.scrollTop
        : window.scrollY || document.documentElement.scrollTop;

      if (scrollY > 0 && posts.length > 0) {
        saveScrollState(key, {
          scrollTop: scrollY,
          firstVisibleId: posts[0]?.id,
          loadedPostIds: posts.map((p) => p.id),
        });
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      handleScroll();
      el.removeEventListener('scroll', handleScroll);
    };
  }, [key, posts, containerRef]);
}
