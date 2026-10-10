import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../app/Sidebar';
import { RightColumn } from '../../app/RightColumn';
import { MobileTopBar } from '../../app/MobileTopBar';
import { BottomNav } from '../../app/BottomNav';

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
import { CommandPalette } from '../common/CommandPalette';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import { videoManager } from '../../utils/videoPlaybackManager';

export const AppLayout: React.FC = () => {
  const {
    activeView,
    currentUser,
    openLoginModal,
    navigateToLanding,
    setIsCreatePostModalOpen,
  } = useApp();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

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
      // Focus or expand composer and scroll to top
      const feedScroller = document.querySelector('[role="feed"]')?.parentElement;
      if (feedScroller) {
        feedScroller.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const composerInput = document.querySelector<HTMLElement>('[data-composer-input="true"]');
      if (composerInput) {
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

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[var(--bg)] text-[var(--text)] flex justify-center">
      <div className="w-full max-w-[1340px] flex h-full">
        {/* Left Sidebar (>= 960px) */}
        <Sidebar onPostClick={handlePostAction} />

        {/* Center Primary Workspace */}
        <main className="flex-1 min-w-0 flex flex-col h-full bg-[var(--bg)] pb-[56px] md:pb-0 overflow-hidden">
          {/* Mobile Top Bar (< 960px) */}
          <MobileTopBar onOpenSearch={() => setIsCommandPaletteOpen(true)} />

          {/* Active View Container */}
          <div className="flex-1 min-h-0 flex justify-center">
            {renderActiveView()}
          </div>
        </main>

        {/* Right Desktop Discovery Column (Hidden in Messages or < 1200px) */}
        {activeView !== 'messages' && <RightColumn />}
      </div>

      {/* Mobile Bottom Navigation Bar (< 960px) */}
      <BottomNav onPostClick={handlePostAction} />

      {/* Global Interactive Modals */}
      <PostDetailModal />
      <CreatePostModal />
      <QuotePostModal />
      <ReportModal />
      <AuthModal />
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

