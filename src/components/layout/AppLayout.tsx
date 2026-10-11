import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../app/Sidebar';
import { RightColumn } from '../../app/RightColumn';
import { MobileTopBar } from '../../app/MobileTopBar';
import { BottomNav } from '../../app/BottomNav';
import { MobileDrawer } from '../../app/MobileDrawer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useVisualViewport } from '../../hooks/useVisualViewport';
import { useShellMode } from '../../app/breakpoints';

// Views
import { FeedPage } from '../../features/feed/FeedPage';
import { ExploreView } from '../explore/ExploreView';
import { NotificationsView } from '../notifications/NotificationsView';
import { MessagesView } from '../messages/MessagesView';
import { BookmarksView } from '../bookmarks/BookmarksView';
import { CommunitiesView } from '../communities/CommunitiesView';
import { LegalServicesView } from '../services/LegalServicesView';
import { LegalAidView } from '../legalaid/LegalAidView';
import { LawsView } from '../laws/LawsView';
import { LegalNewsView } from '../news/LegalNewsView';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { ProfileView } from '../profile/ProfileView';
import { AdminDashboard } from '../admin/AdminDashboard';
import { SettingsView } from '../settings/SettingsView';

// Modals & Navigation Tools
import { PostDetailModal } from '../feed/PostDetailModal';
import { CreatePostModal } from '../modals/CreatePostModal';
import { QuotePostModal } from '../feed/QuotePostModal';
import { ReportModal } from '../modals/ReportModal';
import { AuthModal } from '../auth/AuthModal';
import { CreateStoryModal } from '../feed/CreateStoryModal';
import { StoryViewerModal } from '../feed/StoryViewerModal';
import { CommandPalette } from '../common/CommandPalette';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import { videoManager } from '../../utils/videoPlaybackManager';

export const AppLayout: React.FC = () => {
  const {
    activeView,
    activeConversationId,
    currentUser,
    openLoginModal,
    navigateToLanding,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    isCreateStoryModalOpen,
    setIsCreateStoryModalOpen,
    activeStoryModal,
    setActiveStoryModal,
    stories,
    setStories,
  } = useApp();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const shellMode = useShellMode();
  const isMobileShell = shellMode === 'mobile';
  const { isMobile, isTablet, isLandscapePhone } = useBreakpoint();
  useVisualViewport(); // syncs --kb-h CSS variable with window.visualViewport

  // Left-edge swipe to open avatar drawer (within 24px of screen edge)
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientX <= 24) {
      touchStartXRef.current = e.touches[0].clientX;
    } else {
      touchStartXRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const deltaX = e.touches[0].clientX - touchStartXRef.current;
      if (deltaX > 40) {
        setIsDrawerOpen(true);
        touchStartXRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };

  // Global Keyboard Shortcuts (⌘K, J/K, M, ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const rightSearch = document.getElementById('right-sidebar-search-input') as HTMLInputElement | null;
        if (rightSearch && window.innerWidth >= 1200) {
          rightSearch.focus();
          rightSearch.select();
        } else {
          setIsCommandPaletteOpen((prev) => !prev);
        }
        return;
      }

      if (isInput) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        videoManager.toggleGlobalMute();
      }
    };

    const handleCustomOpen = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleCustomOpen);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('open-command-palette', handleCustomOpen);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handlePostAction = () => {
    if (activeView === 'feed') {
      const feedScroller = document.querySelector('[role="feed"]')?.parentElement;
      if (feedScroller) {
        feedScroller.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const composerInput = document.querySelector<HTMLElement>('[data-composer-input="true"]');
      if (composerInput) {
        composerInput.click();
        composerInput.focus();
      } else {
        setIsCreatePostModalOpen(true);
      }
    } else {
      setIsCreatePostModalOpen(true);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'feed':
        return <FeedPage />;
      case 'explore':
        return <ExploreView />;
      case 'notifications':
        return <NotificationsView />;
      case 'messages':
        return <MessagesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'communities':
        return <CommunitiesView />;
      case 'services':
        return <LegalServicesView />;
      case 'legalaid':
        return <LegalAidView />;
      case 'laws':
        return <LawsView />;
      case 'news':
        return <LegalNewsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FeedPage />;
    }
  };

  // Determine right column mode:
  // - 'minimal' on explore (since search is in the header, don't duplicate search and trending)
  // - 'off' on messages, admin, and settings (split/wide/settings layout fills area)
  // - 'full' on feed, notifications, bookmarks, communities, profile, laws, news, legalaid, services, appointments
  const rightMode =
    activeView === 'messages' || activeView === 'admin' || activeView === 'settings'
      ? 'off'
      : activeView === 'explore'
      ? 'minimal'
      : 'full';

  // Mobile navigation hidden state:
  // Hidden in conversation threads, composer sheet, story viewer, or when drawer is open
  const isMobileThreadOpen = isMobile && activeView === 'messages' && Boolean(activeConversationId);
  const hideBottomNav =
    isMobileThreadOpen ||
    isCreatePostModalOpen ||
    Boolean(activeStoryModal) ||
    isDrawerOpen;

  const mobileBottomPaddingClass = hideBottomNav
    ? 'pb-0'
    : isLandscapePhone
    ? 'pb-[calc(44px+var(--safe-bottom))]'
    : 'pb-[calc(56px+var(--safe-bottom))]';

  return (
    <div
      data-shell={shellMode}
      onTouchStart={isMobileShell ? handleTouchStart : undefined}
      onTouchMove={isMobileShell ? handleTouchMove : undefined}
      onTouchEnd={isMobileShell ? handleTouchEnd : undefined}
      className={`min-h-[100vh] min-h-[100dvh] ${
        isMobileShell
          ? 'w-full'
          : 'min-[960px]:h-[100vh] min-[960px]:h-[100dvh] min-[960px]:overflow-hidden'
      } bg-[var(--bg)] text-[var(--text)] flex justify-center`}
    >
      <div className={`w-full ${isMobileShell ? 'max-w-none' : 'max-w-[1340px]'} flex h-full`}>
        {/* Left Sidebar (>= 960px: 72px rail; >= 1200px: full 260px+) - never mounted in mobile mode */}
        {shellMode !== 'mobile' && <Sidebar onPostClick={handlePostAction} />}

        {/* Center Primary Workspace */}
        <main
          className={`flex-1 min-w-0 flex flex-col h-full bg-[var(--bg)] ${
            isMobileShell ? mobileBottomPaddingClass : 'min-[960px]:pb-0 overflow-hidden'
          }`}
        >
          {/* Mobile Top Bar (< 960px) - never mounted in rail or full modes */}
          {isMobileShell && (
            <MobileTopBar
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onOpenSearch={() => setIsCommandPaletteOpen(true)}
            />
          )}

          {/* Active View Container: Tablet portrait centered max 680px, phone full width */}
          <div
            className={`flex-1 min-h-0 flex justify-center ${
              isTablet ? 'w-full max-w-[680px] mx-auto' : 'w-full'
            }`}
          >
            {renderActiveView()}
          </div>
        </main>

        {/* Right Desktop Discovery Column (>= 1200px) - never mounted in mobile or rail modes */}
        {shellMode === 'full' && rightMode !== 'off' && <RightColumn mode={rightMode} />}
      </div>

      {/* Avatar Menu Left Drawer - only mounted in mobile mode */}
      {isMobileShell && (
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation Bar (< 960px) - only mounted in mobile mode */}
      {isMobileShell && (
        <BottomNav
          hidden={hideBottomNav}
          onPostClick={handlePostAction}
        />
      )}

      {/* Global Interactive Modals */}
      <PostDetailModal />
      <CreatePostModal />
      <QuotePostModal />
      <ReportModal />
      <AuthModal />
      {isCreateStoryModalOpen && (
        <CreateStoryModal
          isOpen={isCreateStoryModalOpen}
          onClose={() => setIsCreateStoryModalOpen(false)}
          onStoryCreated={(s) => setStories((prev) => [s, ...prev])}
        />
      )}
      {activeStoryModal && (
        <StoryViewerModal
          stories={stories}
          initialStoryIndex={Math.max(0, stories.findIndex((s) => s.id === activeStoryModal.id))}
          onClose={() => setActiveStoryModal(null)}
          onStoryDeleted={(id) => setStories((prev) => prev.filter((s) => s.id !== id))}
        />
      )}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};
