import React from 'react';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  Briefcase,
  ShieldAlert,
  Scale,
  Newspaper,
  Calendar,
  Settings,
  ShieldCheck,
  Feather,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface SidebarProps {
  onPostClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onPostClick }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    unreadNotificationsCount,
    unreadMessagesCount,
    logout,
  } = useApp();

  const NAV_ITEMS = [
    { key: 'feed', label: 'Home', icon: Home },
    { key: 'explore', label: 'Explore', icon: Compass },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { key: 'communities', label: 'Communities', icon: Users },
    { key: 'legalaid', label: 'Legal Aid (MAJ)', icon: ShieldAlert },
    { key: 'laws', label: 'Laws & Codes', icon: Scale },
    { key: 'news', label: 'Gazette & News', icon: Newspaper },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  if (currentUser?.role === 'admin') {
    NAV_ITEMS.push({ key: 'admin', label: 'Admin Center', icon: ShieldCheck });
  }

  return (
    <aside
      className="hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg)] select-none w-[72px] xl:w-[260px] 2xl:w-[280px] p-3 no-scrollbar"
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Top Section: Brand + Language + Nav Items */}
      <div className="flex flex-col min-h-0">
        {/* Brand Row with L + X Monogram Logo */}
        <div className="flex items-center justify-between px-2 py-3 mb-1">
          <div
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 shrink-0 text-[var(--accent)] group-hover:scale-105 transition-transform">
              <LogoIcon />
            </div>
            <div className="hidden xl:block">
              <div className="font-extrabold text-[16px] tracking-tight text-[var(--text)] leading-none">
                Lex Hafi Yawe
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mt-0.5">
                Rwanda Legal
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Navigation list */}
        <nav
          className="flex flex-col space-y-1 min-h-0"
          style={{
            gap: 'clamp(2px, 0.8vh, 6px)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key as any)}
                title={item.label}
                className={`relative flex items-center gap-4 w-full rounded-full transition-colors cursor-pointer justify-center xl:justify-start px-3 ${
                  isActive
                    ? 'font-bold text-[var(--text)] bg-[var(--hover)]'
                    : 'text-[var(--text)] font-normal hover:bg-[var(--hover)]'
                }`}
                style={{
                  paddingTop: 'clamp(6px, 1.1vh, 10px)',
                  paddingBottom: 'clamp(6px, 1.1vh, 10px)',
                }}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : ''}`} />
                  {item.badge ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="hidden xl:inline text-[15px] truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* One Orange Post Action Button */}
        <div
          style={{
            marginTop: 'clamp(8px, 1.4vh, 16px)',
          }}
        >
          <button
            type="button"
            onClick={onPostClick}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-semibold transition-all shadow-sm cursor-pointer h-[44px]"
          >
            <Feather className="w-5 h-5 xl:hidden" />
            <span className="hidden xl:inline text-[15px]">Post</span>
          </button>
        </div>
      </div>

      {/* Bottom User Card */}
      {currentUser && (
        <div className="pt-2 border-t border-[var(--border)] mt-2">
          <div className="flex items-center justify-between p-2 rounded-full hover:bg-[var(--hover)] transition-colors group">
            <div
              onClick={() => setActiveView('profile')}
              className="flex items-center gap-3 min-w-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-[var(--text)]">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="hidden xl:block min-w-0">
                <div className="text-[13px] font-semibold text-[var(--text)] truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-[var(--muted)] truncate">
                  @{currentUser.username}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
