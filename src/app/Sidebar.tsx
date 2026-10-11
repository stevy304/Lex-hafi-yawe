import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  ShieldAlert,
  Scale,
  Newspaper,
  ShieldCheck,
  Feather,
  LogOut,
  MoreHorizontal,
  ChevronUp,
  User,
  Settings,
  Command,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';

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

  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState<number>(320);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setNavHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close menus on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isShortTier = windowHeight < 640;
  const isMediumTier = windowHeight >= 640 && windowHeight < 820;

  const itemHeight = isShortTier ? 36 : isMediumTier ? 40 : 44;
  const itemGap = isShortTier ? 4 : isMediumTier ? 6 : 8;

  interface NavItem {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  // Primary items in priority order (0 = highest priority)
  const PRIMARY_ITEMS: NavItem[] = [
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
  ];

  // Secondary items (always start in More)
  const SECONDARY_ITEMS: NavItem[] = [
    { key: 'legalaid', label: 'Legal Aid (MAJ)', icon: ShieldAlert },
    { key: 'laws', label: 'Laws & Codes', icon: Scale },
    { key: 'news', label: 'Gazette & News', icon: Newspaper },
  ];

  if (currentUser?.role === 'admin') {
    SECONDARY_ITEMS.push({ key: 'admin', label: 'Admin Center', icon: ShieldCheck });
  }

  // Calculate visible primary items based on measured nav height
  // Reserve 1 slot for "More" button
  const maxSlots = Math.max(2, Math.floor((navHeight + itemGap) / (itemHeight + itemGap)));
  // We can show at most 6 primary items, at least 3
  const visiblePrimaryCount = Math.min(6, Math.max(3, maxSlots - 1));

  const visiblePrimaryItems = PRIMARY_ITEMS.slice(0, visiblePrimaryCount);
  const demotedItems = PRIMARY_ITEMS.slice(visiblePrimaryCount);

  const overflowItems = [...demotedItems, ...SECONDARY_ITEMS];

  const moreBadgeCount = overflowItems.reduce((acc, item) => acc + (item.badge || 0), 0);
  const isMoreActive = overflowItems.some((item) => activeView === item.key);

  return (
    <aside
      className="hidden min-[960px]:grid shrink-0 select-none w-[72px] min-[1200px]:w-[260px] 2xl:w-[280px] p-3 no-scrollbar border-r border-[var(--border)] bg-[var(--bg)]"
      style={{
        gridTemplateRows: isShortTier
          ? 'auto minmax(0, 1fr) auto auto'
          : 'auto auto minmax(0, 1fr) auto auto',
        rowGap: isShortTier ? '4px' : isMediumTier ? '6px' : 'clamp(6px, 1.2vh, 12px)',
        height: '100dvh',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. Brand block (auto) */}
      <div
        data-testid="brand"
        onClick={() => setActiveView('feed')}
        className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 min-w-0"
      >
        <div className="w-9 h-9 shrink-0 text-[var(--accent)] group-hover:scale-105 transition-transform flex items-center justify-center">
          <LogoIcon size={36} />
        </div>
        <div className="hidden xl:flex flex-col min-w-0">
          <div className="font-extrabold text-[16px] text-[var(--text)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Lex Hafi Yawe
          </div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)] whitespace-nowrap overflow-hidden text-ellipsis">
            Rwanda digital justice
          </div>
        </div>
      </div>

      {/* 2. Language switcher row (auto; hidden in the Short tier < 640px) */}
      {!isShortTier && (
        <div className="hidden xl:block min-w-0 px-1">
          <LanguageSwitcher fullWidth />
        </div>
      )}

      {/* 3. Nav (minmax(0, 1fr); overflow: hidden; the only flexible row) */}
      <nav
        ref={navRef}
        className="flex flex-col min-h-0 relative"
        style={{
          gap: `${itemGap}px`,
          overflow: 'hidden',
        }}
      >
        {visiblePrimaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              data-testid="nav-item"
              type="button"
              onClick={() => setActiveView(item.key as any)}
              title={item.label}
              aria-label={item.label}
              className={`relative flex items-center gap-3.5 w-full rounded-[10px] transition-colors cursor-pointer justify-center xl:justify-start px-3 shrink-0 ${
                isActive
                  ? 'font-medium text-[var(--text)] bg-[var(--hover)]'
                  : 'text-[var(--text)] font-normal hover:bg-[var(--hover)]'
              }`}
              style={{
                height: `${itemHeight}px`,
              }}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : ''}`} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="hidden xl:inline text-[15px] font-medium truncate">{item.label}</span>
            </button>
          );
        })}

        {/* More item button */}
        <div className="relative shrink-0">
          <button
            data-testid="nav-more"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMoreMenuOpen}
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            title="More"
            aria-label="More options"
            className={`relative flex items-center gap-3.5 w-full rounded-[10px] transition-colors cursor-pointer justify-center xl:justify-start px-3 ${
              isMoreActive || isMoreMenuOpen
                ? 'font-medium text-[var(--text)] bg-[var(--hover)]'
                : 'text-[var(--text)] font-normal hover:bg-[var(--hover)]'
            }`}
            style={{
              height: `${itemHeight}px`,
            }}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'text-[var(--accent)]' : ''}`} />
              {moreBadgeCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                  {moreBadgeCount > 9 ? '9+' : moreBadgeCount}
                </span>
              ) : null}
            </div>
            <span className="hidden xl:inline text-[15px] font-medium truncate">More</span>
          </button>

          {/* More menu popover */}
          {isMoreMenuOpen && (
            <div
              ref={moreMenuRef}
              role="menu"
              aria-label="More navigation items"
              className="absolute bottom-full left-0 mb-1 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-1.5 z-50 space-y-1"
            >
              {overflowItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveView(item.key as any);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[14px] transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'font-medium text-[var(--text)] bg-[var(--hover)]'
                        : 'text-[var(--text)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* 4. Post button (auto; always fully visible) */}
      <div className="min-w-0">
        <button
          data-testid="post-button"
          type="button"
          onClick={onPostClick}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          style={{ height: 'clamp(40px, 6vh, 48px)' }}
        >
          <Feather className="w-5 h-5 xl:hidden shrink-0" />
          <span className="hidden xl:inline text-[15px] font-semibold">Post</span>
        </button>
      </div>

      {/* 5. User card (auto; always fully visible, pinned to the bottom) */}
      {currentUser && (
        <div className="relative pt-1 border-t border-[var(--border)] min-w-0">
          <div
            data-testid="user-card"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center justify-between p-1 rounded-full hover:bg-[var(--hover)] transition-colors cursor-pointer group min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-[36px] h-[36px] rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-[var(--text)]">
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
                <div
                  className="text-[14px] font-medium text-[var(--text)] truncate leading-tight"
                  title={currentUser.name}
                >
                  {currentUser.name}
                </div>
                <div className="text-[12px] text-[var(--muted)] truncate leading-tight">
                  @{currentUser.username}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] truncate leading-tight">
                  {currentUser.role === 'advocate' ? 'Advocate' : currentUser.role === 'admin' ? 'Admin' : 'Citizen'}
                </div>
              </div>
            </div>

            <div className="hidden xl:flex items-center justify-center w-6 h-6 text-[var(--muted)] group-hover:text-[var(--text)]">
              <ChevronUp className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* User Menu Popover */}
          {isUserMenuOpen && (
            <div
              ref={userMenuRef}
              role="menu"
              aria-label="User account menu"
              className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 z-50 space-y-1"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActiveView('profile');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[14px] text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-[var(--muted)]" />
                <span>View profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActiveView('settings');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[14px] text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
              >
                <Settings className="w-4 h-4 text-[var(--muted)]" />
                <span>Settings</span>
              </button>

              {isShortTier && (
                <div className="px-3 py-1.5 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--muted)] block mb-1">Language</span>
                  <LanguageSwitcher fullWidth />
                </div>
              )}

              <div className="px-3 py-1.5 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--muted)]">Theme</span>
                <ThemeToggle />
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-shortcuts-modal'));
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[14px] text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
              >
                <Command className="w-4 h-4 text-[var(--muted)]" />
                <span>Keyboard shortcuts</span>
              </button>

              <div className="border-t border-[var(--border)] pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[14px] text-[var(--danger)] hover:bg-[rgba(255,122,122,0.08)] transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
