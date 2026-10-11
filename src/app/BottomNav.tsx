import React from 'react';
import { Home, Compass, Feather, MessageSquare, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface BottomNavProps {
  onPostClick: () => void;
  hidden?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onPostClick, hidden = false }) => {
  const {
    activeView,
    setActiveView,
    unreadNotificationsCount,
    unreadMessagesCount,
  } = useApp();
  const { isLandscapePhone } = useBreakpoint();

  if (hidden) {
    return null;
  }

  const handleTabClick = (view: 'feed' | 'explore' | 'messages' | 'notifications') => {
    if (activeView === view) {
      // Tapping active tab scrolls to top
      const scrollRoot = document.querySelector('[data-scroll-root="true"]') as HTMLElement | null;
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActiveView(view);
    }
  };

  const navHeightStyle = isLandscapePhone
    ? 'calc(44px + var(--safe-bottom))'
    : 'calc(56px + var(--safe-bottom))';

  const formatBadge = (count: number) => (count > 99 ? '99+' : count.toString());

  return (
    <nav
      data-testid="bottom-nav"
      aria-label="Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-t border-[var(--border)] flex items-center justify-around px-2 select-none"
      style={{
        height: navHeightStyle,
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => handleTabClick('feed')}
        aria-label="Home"
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 cursor-pointer transition-colors ${
          activeView === 'feed'
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
      >
        <Home className="w-6 h-6 shrink-0" />
        {!isLandscapePhone && (
          <span className="text-[11px] leading-tight mt-0.5">Home</span>
        )}
      </button>

      {/* 2. Explore */}
      <button
        type="button"
        onClick={() => handleTabClick('explore')}
        aria-label="Explore"
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 cursor-pointer transition-colors ${
          activeView === 'explore'
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
      >
        <Compass className="w-6 h-6 shrink-0" />
        {!isLandscapePhone && (
          <span className="text-[11px] leading-tight mt-0.5">Explore</span>
        )}
      </button>

      {/* 3. Post (Center accent button) */}
      <button
        type="button"
        onClick={onPostClick}
        aria-label="Create post"
        className="w-[44px] h-[44px] rounded-full bg-[var(--accent)] hover:brightness-110 active:scale-95 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all shrink-0"
      >
        <Feather className="w-5 h-5" />
      </button>

      {/* 4. Messages */}
      <button
        type="button"
        onClick={() => handleTabClick('messages')}
        aria-label="Messages"
        className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 cursor-pointer transition-colors ${
          activeView === 'messages'
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 shrink-0" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {formatBadge(unreadMessagesCount)}
            </span>
          )}
        </div>
        {!isLandscapePhone && (
          <span className="text-[11px] leading-tight mt-0.5">Messages</span>
        )}
      </button>

      {/* 5. Notifications */}
      <button
        type="button"
        onClick={() => handleTabClick('notifications')}
        aria-label="Notifications"
        className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 cursor-pointer transition-colors ${
          activeView === 'notifications'
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
      >
        <div className="relative">
          <Bell className="w-6 h-6 shrink-0" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {formatBadge(unreadNotificationsCount)}
            </span>
          )}
        </div>
        {!isLandscapePhone && (
          <span className="text-[11px] leading-tight mt-0.5">Alerts</span>
        )}
      </button>
    </nav>
  );
};
