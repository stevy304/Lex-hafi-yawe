import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Post, User, Story, PostCitation } from '../../types';
import { useApp } from '../../context/AppContext';
import { TabBar, FeedTabKey } from './components/TabBar';
import { ChipBar } from './components/ChipBar';
import { StoriesRow } from './components/StoriesRow';
import { Composer } from '../composer/Composer';
import { NewPostsPill } from './components/NewPostsPill';
import { FeedList } from './components/FeedList';
import { FeedSkeleton } from './components/FeedSkeleton';
import { FeedEmpty } from './components/FeedEmpty';
import { FeedError } from './components/FeedError';
import { BackToTop } from './components/BackToTop';
import { ShortcutsDialog } from './components/ShortcutsDialog';

import { useScrollDirection } from './hooks/useScrollDirection';
import { useInfiniteFeed } from './hooks/useInfiniteFeed';
import { useFeedRestoration } from './hooks/useFeedRestoration';
import { useNewPosts } from './hooks/useNewPosts';
import { useFeedHotkeys } from './hooks/useFeedHotkeys';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { useTabSwipe } from './hooks/useTabSwipe';

export const FeedPage: React.FC = () => {
  const {
    currentUser,
    users,
    stories = [],
    openCreateStoryModal,
    openStoryModal,
    setSelectedPostId,
    likePost,
    bookmarkPost,
    deletePost,
    reportPost,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  // URL-synced filter states
  const tabParam = (searchParams.get('tab') as FeedTabKey) || 'for_you';
  const topicParam = searchParams.get('topic') || 'All topics';
  const verifiedParam = searchParams.get('verified') === 'true';
  const mediaParam = searchParams.get('media') === 'true';

  const [currentTab, setCurrentTab] = useState<FeedTabKey>(tabParam);
  const [selectedTopic, setSelectedTopic] = useState<string>(topicParam);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(verifiedParam);
  const [mediaOnly, setMediaOnly] = useState<boolean>(mediaParam);

  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [optimisticNewPostId, setOptimisticNewPostId] = useState<string | undefined>();

  // Center column scroll container
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state to URL params
  const updateFilters = useCallback(
    (newTab: FeedTabKey, newTopic: string, newVerified: boolean, newMedia: boolean) => {
      const params = new URLSearchParams();
      if (newTab !== 'for_you') params.set('tab', newTab);
      if (newTopic !== 'All topics') params.set('topic', newTopic);
      if (newVerified) params.set('verified', 'true');
      if (newMedia) params.set('media', 'true');
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleSelectTab = (tab: FeedTabKey) => {
    setCurrentTab(tab);
    updateFilters(tab, selectedTopic, verifiedOnly, mediaOnly);
    // Changing filter scrolls to top
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    updateFilters(currentTab, topic, verifiedOnly, mediaOnly);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleToggleVerified = () => {
    const next = !verifiedOnly;
    setVerifiedOnly(next);
    updateFilters(currentTab, selectedTopic, next, mediaOnly);
  };

  const handleToggleMedia = () => {
    const next = !mediaOnly;
    setMediaOnly(next);
    updateFilters(currentTab, selectedTopic, verifiedOnly, next);
  };

  // Scroll direction hook
  const scrollDirection = useScrollDirection(containerRef, { threshold: 12 });

  // Infinite feed hook
  const {
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
  } = useInfiniteFeed({
    tab: currentTab,
    topic: selectedTopic,
    verifiedOnly,
    mediaOnly,
  });

  // Scroll restoration
  useFeedRestoration(
    containerRef,
    currentTab,
    selectedTopic,
    verifiedOnly,
    mediaOnly,
    posts,
    isInitialLoading
  );

  // New posts streaming and pill
  const { newCount, flushNewPosts } = useNewPosts({
    containerRef,
    onAutoInsert: (newPosts) => {
      setPosts((prev) => [...newPosts, ...prev]);
    },
  });

  const handleInsertQueuedPosts = () => {
    const newItems = flushNewPosts();
    if (newItems.length > 0) {
      setPosts((prev) => [...newItems, ...prev]);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        containerRef.current.focus();
      }
    }
  };

  // Pull to refresh on mobile
  const { pullDistance, isRefreshing: isPullRefreshing } = usePullToRefresh({
    containerRef,
    onRefresh: refetch,
  });

  // Tab swipe on mobile
  const tabOrder: FeedTabKey[] = ['for_you', 'following', 'professionals', 'official', 'communities'];
  useTabSwipe({
    containerRef,
    onSwipeLeft: () => {
      const idx = tabOrder.indexOf(currentTab);
      if (idx < tabOrder.length - 1) handleSelectTab(tabOrder[idx + 1]);
    },
    onSwipeRight: () => {
      const idx = tabOrder.indexOf(currentTab);
      if (idx > 0) handleSelectTab(tabOrder[idx - 1]);
    },
  });

  // Hotkeys: j/k, l, b, c, n, /, ., ?
  const currentPostIndexRef = useRef<number>(0);
  useFeedHotkeys({
    onNextPost: () => {
      const postElements = Array.from(document.querySelectorAll<HTMLElement>('[data-feed-post-id]'));
      if (postElements.length === 0) return;
      const nextIdx = Math.min(currentPostIndexRef.current + 1, postElements.length - 1);
      currentPostIndexRef.current = nextIdx;
      postElements[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      postElements[nextIdx]?.focus();
    },
    onPrevPost: () => {
      const postElements = Array.from(document.querySelectorAll<HTMLElement>('[data-feed-post-id]'));
      if (postElements.length === 0) return;
      const prevIdx = Math.max(0, currentPostIndexRef.current - 1);
      currentPostIndexRef.current = prevIdx;
      postElements[prevIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      postElements[prevIdx]?.focus();
    },
    onLikeCurrent: () => {
      const currentPost = posts[currentPostIndexRef.current];
      if (currentPost) likePost?.(currentPost.id);
    },
    onBookmarkCurrent: () => {
      const currentPost = posts[currentPostIndexRef.current];
      if (currentPost) bookmarkPost?.(currentPost.id);
    },
    onCommentCurrent: () => {
      const currentPost = posts[currentPostIndexRef.current];
      if (currentPost) setSelectedPostId?.(currentPost.id);
    },
    onOpenComposer: () => {
      setIsComposerExpanded(true);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    },
    onFocusSearch: () => {
      const searchInput = document.getElementById('right-sidebar-search-input') as HTMLInputElement | null;
      searchInput?.focus();
    },
    onJumpToNewPosts: handleInsertQueuedPosts,
    onOpenShortcutsDialog: () => setIsShortcutsOpen(true),
  });

  const handlePostSuccess = (newPost: Post) => {
    insertOptimisticPost(newPost);
    setOptimisticNewPostId(newPost.id);
    setTimeout(() => setOptimisticNewPostId(undefined), 1500);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tabLabels: Record<FeedTabKey, string> = {
    for_you: 'For you',
    following: 'Following',
    professionals: 'Professionals',
    official: 'Official',
    communities: 'Communities',
  };

  const hasActiveFilters = selectedTopic !== 'All topics' || verifiedOnly || mediaOnly;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text"
      style={{
        overflowAnchor: 'auto',
      }}
    >
      {/* Pull to refresh visual indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center py-2 text-xs text-[var(--muted)] transition-all"
          style={{ height: pullDistance }}
        >
          {isPullRefreshing ? 'Refreshing feed...' : 'Pull down to refresh'}
        </div>
      )}

      {/* 1. TabBar: sticky, height 48, top 0, z-index 30 */}
      <TabBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isRefetching={isRefetching}
        onScrollToTopAndRefetch={refetch}
        labels={tabLabels}
        hideOnScroll={scrollDirection === 'down' && window.innerWidth < 960}
      />

      {/* 2. ChipBar: sticky, height 44, top 48, z-index 20. Hides on 'down' */}
      <ChipBar
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        verifiedOnly={verifiedOnly}
        onToggleVerifiedOnly={handleToggleVerified}
        mediaOnly={mediaOnly}
        onToggleMediaOnly={handleToggleMedia}
        hideOnScroll={scrollDirection === 'down'}
      />

      {/* 3. StoriesRow: scrolls away */}
      <StoriesRow
        currentUser={currentUser}
        stories={stories}
        users={users}
        onOpenCreateStory={openCreateStoryModal}
        onOpenStory={openStoryModal}
      />

      {/* 4. Composer: collapsed (56px) expands on focus */}
      <Composer
        currentUser={currentUser}
        isExpandedControlled={isComposerExpanded}
        onExpandChange={setIsComposerExpanded}
        onPostSuccess={handlePostSuccess}
        defaultTopic={selectedTopic !== 'All topics' ? selectedTopic : 'General legal'}
      />

      {/* 5. NewPostsPill: sticky row below sticky bars */}
      <NewPostsPill
        count={newCount}
        onClick={handleInsertQueuedPosts}
        chipBarVisible={scrollDirection !== 'down'}
      />

      {/* 6. Feed Content States */}
      {isInitialLoading || showFilterSkeletons ? (
        <FeedSkeleton count={3} />
      ) : isError && posts.length === 0 ? (
        <FeedError onRetry={refetch} />
      ) : posts.length === 0 ? (
        <FeedEmpty
          tab={currentTab}
          hasFilters={hasActiveFilters}
          onAction={() => {
            if (hasActiveFilters) {
              setSelectedTopic('All topics');
              setVerifiedOnly(false);
              setMediaOnly(false);
              updateFilters(currentTab, 'All topics', false, false);
            }
          }}
        />
      ) : (
        <div className={`transition-opacity duration-200 ${isDimmed ? 'opacity-60' : 'opacity-100'}`}>
          <FeedList
            posts={posts}
            users={users}
            currentUser={currentUser}
            containerRef={containerRef}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isNextPageError={isNextPageError}
            onFetchNextPage={fetchNextPage}
            onRetryNextPage={fetchNextPage}
            onPostClick={(id) => setSelectedPostId?.(id)}
            onLikeToggle={likePost}
            onBookmarkToggle={bookmarkPost}
            onDeletePost={deletePost}
            onReportPost={reportPost}
            isForYouTab={currentTab === 'for_you'}
            optimisticNewPostId={optimisticNewPostId}
          />
        </div>
      )}

      {/* 7. Back to top button */}
      <BackToTop
        containerRef={containerRef}
        direction={scrollDirection}
        onScrollToTop={handleScrollToTop}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
