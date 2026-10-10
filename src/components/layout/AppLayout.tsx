import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';

// Views
import { FeedView } from '../feed/FeedView';
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
  const { activeView, currentUser, openLoginModal, navigateToLanding } = useApp();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Global Keyboard Shortcuts (⌘K, J/K, M, ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Command + K or Ctrl + K: Focus right-column search on desktop, command palette on mobile
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const rightSearch = document.getElementById('right-sidebar-search-input') as HTMLInputElement | null;
        if (rightSearch && window.innerWidth >= 1024) {
          rightSearch.focus();
          rightSearch.select();
        } else {
          setIsCommandPaletteOpen(prev => !prev);
        }
        return;
      }

      // If user is currently typing in a field, ignore single key shortcuts
      if (isInput) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        videoManager.toggleGlobalMute();
      } else if (e.key.toLowerCase() === 'j') {
        // Scroll to next post
        e.preventDefault();
        const posts = Array.from(document.querySelectorAll('[data-feed-post-id]'));
        if (posts.length > 0) {
          const currentY = window.scrollY;
          const next = posts.find(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > 120; // below header
          });
          if (next) {
            next.scrollIntoView({ behavior: 'smooth', block: 'start' });
            (next as HTMLElement).focus?.();
          }
        }
      } else if (e.key.toLowerCase() === 'k') {
        // Scroll to previous post
        e.preventDefault();
        const posts = Array.from(document.querySelectorAll('[data-feed-post-id]'));
        if (posts.length > 0) {
          const reversed = [...posts].reverse();
          const prev = reversed.find(el => {
            const rect = el.getBoundingClientRect();
            return rect.top < -60;
          });
          if (prev) {
            prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
            (prev as HTMLElement).focus?.();
          }
        }
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

  const renderActiveView = () => {
    switch (activeView) {
      case 'feed':
        return <FeedView />;
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
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#334155] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1400px] flex">
        {/* Left Desktop Column */}
        <div className="hidden lg:block shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Primary Workspace */}
        <main className="flex-1 min-w-0 border-r border-[#E3DDD4] bg-white min-h-screen pb-16 lg:pb-0">
          {/* Mobile Top Header */}
          <MobileNav onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

          {/* Guest Mode Notice Banner */}
          {!currentUser && (
            <div className="bg-[#45525A] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#323C42]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D36B2E] animate-pulse shrink-0" />
                <span>
                  <strong>Guest Mode:</strong> You are exploring public feeds and Rwanda legal resources.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openLoginModal}
                  className="px-2.5 py-1 bg-[#D36B2E] hover:bg-[#B8551E] font-bold text-white rounded-lg transition text-[11px] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={navigateToLanding}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 font-semibold text-white/90 rounded-lg transition text-[11px] cursor-pointer"
                >
                  Welcome Page
                </button>
              </div>
            </div>
          )}

          {/* Active Primary View */}
          {renderActiveView()}
        </main>

        {/* Right Desktop Discovery Column (Hidden in Messages to maximize chat width) */}
        {activeView !== 'messages' && (
          <div className="hidden lg:block shrink-0">
            <RightSidebar />
          </div>
        )}
      </div>

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
