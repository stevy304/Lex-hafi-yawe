import React from 'react';
import { Home, Compass, Feather, MessageSquare, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onPostClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onPostClick }) => {
  const {
    activeView,
    setActiveView,
    unreadNotificationsCount,
    unreadMessagesCount,
  } = useApp();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-around h-[56px] px-2 select-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => setActiveView('feed')}
        aria-label="Home feed"
        className={`flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors ${
          activeView === 'feed' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'
        }`}
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Explore */}
      <button
        type="button"
        onClick={() => setActiveView('explore')}
        aria-label="Explore"
        className={`flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors ${
          activeView === 'explore' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'
        }`}
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Post (Center circular accent button) */}
      <button
        type="button"
        onClick={onPostClick}
        aria-label="Create post"
        className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md active:scale-95 cursor-pointer -mt-4 transition-transform"
      >
        <Feather className="w-5 h-5" />
      </button>

      {/* Messages */}
      <button
        type="button"
        onClick={() => setActiveView('messages')}
        aria-label="Messages"
        className={`relative flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors ${
          activeView === 'messages' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        {unreadMessagesCount ? (
          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
          </span>
        ) : null}
      </button>

      {/* Notifications */}
      <button
        type="button"
        onClick={() => setActiveView('notifications')}
        aria-label="Notifications"
        className={`relative flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors ${
          activeView === 'notifications' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount ? (
          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        ) : null}
      </button>
    </nav>
  );
};
