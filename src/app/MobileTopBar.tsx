import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { LogoIcon } from '../components/LogoIcon';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface MobileTopBarProps {
  hideOnScroll?: boolean;
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
  headerAction?: React.ReactNode;
  title?: string;
  onBack?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  hideOnScroll = false,
  onOpenDrawer,
  onOpenSearch,
  headerAction,
  title,
  onBack,
}) => {
  const { currentUser, setActiveView, activeView } = useApp();
  const { isLandscapePhone } = useBreakpoint();

  // Hide completely in landscape phones (height < 500px)
  if (isLandscapePhone) {
    return null;
  }

  // Views that naturally have back actions
  const showBack = Boolean(onBack);

  return (
    <header
      className={`lg:hidden sticky top-0 z-40 w-full bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-3 flex items-center justify-between transition-transform duration-200 ease-out select-none ${
        hideOnScroll ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        height: 'calc(48px + var(--safe-top))',
        paddingTop: 'var(--safe-top)',
      }}
    >
      {/* Left Item */}
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--hover)] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open menu drawer"
            className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-bold text-xs text-[var(--text)] cursor-pointer shrink-0 active:scale-95 transition-transform"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{currentUser?.name?.slice(0, 2).toUpperCase() || 'LX'}</span>
            )}
          </button>
        )}

        {/* Center / Title Area */}
        {showBack && title ? (
          <h1 className="text-[18px] font-semibold text-[var(--text)] truncate max-w-[200px] sm:max-w-[320px]">
            {title}
          </h1>
        ) : (
          <div
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <div className="w-6 h-6 text-[var(--accent)] shrink-0">
              <LogoIcon />
            </div>
            <span className="font-bold text-[15px] text-[var(--text)] tracking-tight">
              Lex Hafi Yawe
            </span>
          </div>
        )}
      </div>

      {/* Right controls: search + header action */}
      <div className="flex items-center gap-1 shrink-0">
        {headerAction ? (
          headerAction
        ) : (
          <button
            type="button"
            onClick={onOpenSearch || (() => setActiveView('explore'))}
            aria-label="Search"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--hover)] cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
