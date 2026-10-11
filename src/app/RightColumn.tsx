import React, { useState, useEffect } from 'react';
import { Search, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface RightColumnProps {
  mode?: 'full' | 'minimal';
}

export const RightColumn: React.FC<RightColumnProps> = ({ mode = 'full' }) => {
  const { users, currentUser, setActiveView } = useApp();
  const [kigaliTime, setKigaliTime] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Kigali',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date());
        setKigaliTime(timeStr);
      } catch {
        setKigaliTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trending legal topics (max 5)
  const TRENDING_TOPICS = [
    { tag: '#LandRegistrationRw', topic: 'Land & Property (UPI)' },
    { tag: '#LaborCode2018', topic: 'Employment & Severance' },
    { tag: '#AbunziMediation', topic: 'Alternative Dispute Resolution' },
    { tag: '#DataProtectionRw', topic: 'Data Privacy Compliance' },
    { tag: '#FamilySuccession', topic: 'Matrimonial Regimes' },
  ];

  // Verified advocates to follow (max 3, exclude current user)
  const verifiedAdvocates = users
    .filter(
      (u) =>
        (u.role === 'advocate' || u.isVerified) &&
        u.id !== currentUser?.id
    )
    .slice(0, 3);

  const toggleFollow = (userId: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <aside
      className="hidden min-[1200px]:flex flex-col gap-3 shrink-0 select-none w-[320px] 2xl:w-[350px] p-3 px-4 overflow-y-auto no-scrollbar border-l border-[var(--border)] bg-[var(--bg)]"
      style={{
        height: '100dvh',
        scrollbarWidth: 'none',
      }}
    >
      {/* 1. Search Box with Ctrl K / Cmd K hint (Hidden in minimal mode) */}
      {mode === 'full' && (
        <div data-testid="search-box" className="relative shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--muted)]" />
          <input
            id="right-sidebar-search-input"
            type="text"
            placeholder="Search Lex Hafi Yawe"
            className="w-full h-[40px] pl-10 pr-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[14px] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <kbd className="absolute right-3.5 top-2.5 px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] font-mono text-[10px] text-[var(--muted)]">
            ⌘K
          </kbd>
        </div>
      )}

      {/* 2. Status line: Green dot + IECMS integrated + Kigali time */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[12px] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse shrink-0" />
          <span className="font-medium text-[var(--text)]">IECMS integrated</span>
        </div>
        <div className="text-[var(--muted)] tabular-nums font-mono text-[11px]">
          Kigali {kigaliTime}
        </div>
      </div>

      {/* 3. MAJ Card (Need free legal help?) */}
      <div data-testid="maj-card" className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-[14px] font-semibold text-[var(--text)]">Need free legal help?</h3>
        </div>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed">
          Access the Ministry of Justice Access to Justice Bureau (MAJ) in your district.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveView('legalaid')}
            className="flex-1 py-1.5 px-3 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-medium text-[12px] transition-colors cursor-pointer text-center truncate"
          >
            Find local bureau
          </button>
          <a
            href="tel:3922"
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] font-medium text-[12px] transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Dial 3922</span>
          </a>
        </div>
      </div>

      {/* 4. Trending legal topics (max 5) - Hidden in minimal mode */}
      {mode === 'full' && (
        <div data-testid="trending-card" className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--text)]">Trending legal topics</h3>
            <span className="text-[12px] text-[var(--muted)] block">Statutory topics</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {TRENDING_TOPICS.slice(0, 5).map((item) => (
              <div key={item.tag} className="py-2 space-y-0.5">
                <a
                  href={`/search?q=${encodeURIComponent(item.tag)}`}
                  className="text-[14px] font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors block truncate"
                >
                  {item.tag}
                </a>
                <span className="text-[13px] text-[var(--muted)] block truncate">{item.topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Verified advocates to follow (HIDE when empty) - Defect 7 fix */}
      {verifiedAdvocates.length > 0 && (
        <div data-testid="advocates-card" className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shrink-0">
          <h3 className="text-[15px] font-semibold text-[var(--text)]">Verified advocates to follow</h3>
          <div className="space-y-3">
            {verifiedAdvocates.slice(0, 3).map((advocate) => {
              const isFollowing = followingMap[advocate.id];
              return (
                <div
                  key={advocate.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px minmax(0, 1fr) auto',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <div className="w-[36px] h-[36px] rounded-full bg-[var(--bg)] border border-[var(--border)] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-[var(--text)]">
                    {advocate.avatar ? (
                      <img
                        src={advocate.avatar}
                        alt={advocate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{advocate.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="font-medium text-[13px] text-[var(--text)] truncate"
                        title={advocate.name}
                      >
                        {advocate.name}
                      </span>
                      <span className="text-[var(--gold)] text-xs shrink-0" aria-label="Verified advocate">✓</span>
                    </div>
                    <div className="text-[12px] text-[var(--muted)] truncate">
                      @{advocate.username}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(advocate.id)}
                    className={`h-[28px] px-3 rounded-full text-[12px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                      isFollowing
                        ? 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--danger)] hover:text-[var(--danger)]'
                        : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Footer: single wrapped 12px line - Defect 8 fix */}
      <footer
        data-testid="right-footer"
        style={{
          marginTop: 'auto',
          paddingTop: '8px',
          position: 'sticky',
          bottom: 0,
          background: 'var(--bg)',
        }}
        className="text-[12px] text-[var(--muted)] leading-relaxed px-1 shrink-0"
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="/about" className="hover:underline">About</a>
          <a href="/help" className="hover:underline">Help</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <span>© 2026 Lex Hafi Yawe</span>
        </div>
      </footer>
    </aside>
  );
};
