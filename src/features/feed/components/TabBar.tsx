import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export type FeedTabKey = 'for_you' | 'following' | 'professionals' | 'official' | 'communities';

export interface TabItem {
  key: FeedTabKey;
  label: string;
}

interface TabBarProps {
  currentTab: FeedTabKey;
  onSelectTab: (tab: FeedTabKey) => void;
  isRefetching?: boolean;
  onScrollToTopAndRefetch?: () => void;
  isScrolledToTop?: boolean;
  hideOnScroll?: boolean; // on mobile scroll down
  labels: Record<FeedTabKey, string>;
  onOpenSearch?: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTab,
  onSelectTab,
  isRefetching = false,
  onScrollToTopAndRefetch,
  isScrolledToTop = true,
  hideOnScroll = false,
  labels,
  onOpenSearch,
}) => {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const TABS: { key: FeedTabKey; label: string }[] = [
    { key: 'for_you', label: labels.for_you || 'For you' },
    { key: 'following', label: labels.following || 'Following' },
    { key: 'professionals', label: labels.professionals || 'Professionals' },
    { key: 'official', label: labels.official || 'Official' },
    { key: 'communities', label: labels.communities || 'Communities' },
  ];

  const handleTabClick = (tabKey: FeedTabKey) => {
    if (tabKey === currentTab) {
      if (isScrolledToTop && onScrollToTopAndRefetch) {
        onScrollToTopAndRefetch();
      } else if (onScrollToTopAndRefetch) {
        onScrollToTopAndRefetch();
      }
    } else {
      onSelectTab(tabKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = TABS.length - 1;
    }

    if (targetIndex >= 0) {
      e.preventDefault();
      const targetTab = TABS[targetIndex];
      onSelectTab(targetTab.key);
      tabButtonRefs.current[targetTab.key]?.focus();
    }
  };

  return (
    <div
      className={`sticky top-0 z-30 w-full bg-[var(--bg)] border-b border-[var(--border)] transition-transform duration-200 ease-out ${
        hideOnScroll ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ height: 48 }}
    >
      <div className="flex items-center justify-between h-full px-2">
        <div
          ref={tabsListRef}
          role="tablist"
          aria-label="Feed sections"
          className="flex items-center h-full overflow-x-auto no-scrollbar flex-1 min-w-0"
        >
          {TABS.map((tab, idx) => {
            const isActive = tab.key === currentTab;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabButtonRefs.current[tab.key] = el;
                }}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls="feed-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabClick(tab.key)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`relative shrink-0 h-full px-[14px] text-[14px] transition-colors cursor-pointer flex items-center justify-center select-none ${
                  isActive
                    ? 'font-medium text-[var(--text)]'
                    : 'font-normal text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-[14px] right-[14px] h-[3px] bg-[var(--accent)] rounded-t-[3px]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Magnifier button for rail mode (960-1199px) */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="hidden md:flex xl:hidden p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer rounded-full"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>

      {/* 2px accent progress bar while refetching */}
      {isRefetching && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
          <div className="h-full bg-[var(--accent)] w-1/3 animate-[pulse_1s_infinite] transition-all" />
        </div>
      )}
    </div>
  );
};
