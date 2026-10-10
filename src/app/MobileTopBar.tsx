import React, { useState } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { useApp } from '../context/AppContext';

interface MobileTopBarProps {
  hideOnScroll?: boolean;
  onOpenSearch?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  hideOnScroll = false,
  onOpenSearch,
}) => {
  const { currentUser, setActiveView } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={`md:hidden sticky top-0 z-40 w-full h-[52px] bg-[var(--bg)] border-b border-[var(--border)] px-4 flex items-center justify-between transition-transform duration-200 ease-out select-none ${
        hideOnScroll ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Brand */}
      <div
        onClick={() => setActiveView('feed')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-8 h-8 text-[var(--accent)]">
          <LogoIcon />
        </div>
        <span className="font-bold text-[15px] text-[var(--text)]">Lex Hafi Yawe</span>
      </div>

      {/* Right controls: search + user avatar menu */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="User settings"
            className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-bold text-xs text-[var(--text)] cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.name?.slice(0, 2).toUpperCase() || 'LX'}</span>
            )}
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-3 z-50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--muted)]">Language</span>
                <LanguageSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--muted)]">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
