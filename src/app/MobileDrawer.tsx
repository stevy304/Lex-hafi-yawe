import React, { useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Users,
  Scale,
  Newspaper,
  ShieldAlert,
  Briefcase,
  Calendar,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useApp, AppView } from '../context/AppContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    activeView,
    setActiveView,
    logout,
    openLoginModal,
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch handlers for swiping left to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    // Swiped left by 60px or more
    if (diff > 60) {
      onClose();
      touchStartXRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    onClose();
  };

  const menuItems: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'profile', label: 'Profile', icon: UserIcon },
    { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { view: 'communities', label: 'Communities', icon: Users },
    { view: 'laws', label: 'Laws & Codes', icon: Scale },
    { view: 'news', label: 'Official Gazette & Legal News', icon: Newspaper },
    { view: 'legalaid', label: 'MAJ Legal Aid', icon: ShieldAlert },
    { view: 'services', label: 'Legal Services', icon: Briefcase },
    { view: 'appointments', label: 'Appointments', icon: Calendar },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 select-none ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer surface */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Account navigation menu"
        className={`absolute top-0 bottom-0 left-0 w-[82vw] max-w-[320px] bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col z-10 transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
          touchAction: 'pan-y',
        }}
      >
        {/* Header: User Profile Card */}
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-bold text-sm text-[var(--text)]">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser?.name?.slice(0, 2).toUpperCase() || 'LX'}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-semibold text-[15px] text-[var(--text)] truncate">
                  <span className="truncate">{currentUser?.name || 'Guest Citizen'}</span>
                  {currentUser?.role === 'advocate' && <VerificationBadge size="sm" />}
                  {currentUser?.role === 'admin' && (
                    <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  )}
                </div>
                <div className="text-[12px] text-[var(--muted)] truncate">
                  @{currentUser?.username || 'guest'}
                </div>
                <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--hover)] text-[var(--muted)]">
                  {currentUser?.role === 'advocate'
                    ? 'Advocate'
                    : currentUser?.role === 'admin'
                    ? 'Admin'
                    : 'Citizen'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--hover)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Followers / Following counts */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)] text-[13px]">
            <span className="text-[var(--text)] font-semibold">
              {currentUser?.followingCount ?? 14}{' '}
              <span className="font-normal text-[var(--muted)]">Following</span>
            </span>
            <span className="text-[var(--text)] font-semibold">
              {currentUser?.followersCount ?? 89}{' '}
              <span className="font-normal text-[var(--muted)]">Followers</span>
            </span>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavigate(item.view)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer text-left min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--hover)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text)] hover:bg-[var(--hover)]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme & Language Controls */}
        <div className="p-3 border-t border-[var(--border)] shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[13px] px-1">
            <span className="text-[var(--muted)]">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between text-[13px] px-1">
            <span className="text-[var(--muted)]">Language</span>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Footer: Auth & Version */}
        <div className="p-3 border-t border-[var(--border)] shrink-0 flex items-center justify-between text-[12px] text-[var(--muted)]">
          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 text-[var(--danger)] hover:underline cursor-pointer min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                openLoginModal();
                onClose();
              }}
              className="text-[var(--accent)] font-semibold hover:underline cursor-pointer min-h-[44px]"
            >
              Sign in
            </button>
          )}
          <span className="text-[11px]">v2026.1 • Lex Hafi Yawe</span>
        </div>
      </div>
    </div>
  );
};
