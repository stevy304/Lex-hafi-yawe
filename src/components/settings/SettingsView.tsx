import React from 'react';
import {
  Globe,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    logout,
    openLoginModal,
  } = useApp();

  const langOptions: { code: Language; label: string; desc: string }[] = [
    { code: 'en', label: 'English', desc: 'Standard business and official legal language in Rwanda' },
    { code: 'rw', label: 'Ikinyarwanda', desc: "Ururimi kavukire rwa repubulika y'u Rwanda" },
    { code: 'fr', label: 'Français', desc: 'Langue officielle et juridique du Rwanda' },
  ];

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Settings"
        subtitle="Configure localization, confidentiality safeguards, and security"
      />

      <div className="p-4 space-y-4">
        {/* Account Session & Authentication Control */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2 m-0">
              <UserIcon className="w-4 h-4 text-[var(--accent)]" />
              <span>Current session and identity</span>
            </h3>

            {currentUser && (
              <span className="text-[11px] bg-[var(--ok-bg)] text-[var(--ok-text)] font-medium px-2 py-0.5 rounded-full">
                Active session
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="flex items-center justify-between p-3 rounded-[10px] bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={currentUser} size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-[14px] font-medium text-[var(--text)] truncate m-0">
                      {currentUser.name}
                    </h4>
                    <VerificationBadge user={currentUser} size="sm" />
                  </div>
                  <p className="text-[12px] text-[var(--muted)] truncate m-0">
                    @{currentUser.username} • {currentUser.email}
                  </p>
                  <span className="text-[11px] font-medium text-[var(--gold)] uppercase tracking-wider block mt-0.5 truncate">
                    Role: {currentUser.role} {currentUser.barRollNumber ? `(${currentUser.barRollNumber})` : ''}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--danger)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-[10px] bg-[var(--bg)] border border-[var(--border)] text-center space-y-2">
              <p className="text-[13px] text-[var(--muted)] font-medium m-0">
                You are currently browsing Lex Hafi Yawe in guest mode.
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in or register account</span>
              </button>
            </div>
          )}
        </Card>

        {/* Language Selection */}
        <Card>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2 mb-3 m-0">
            <Globe className="w-4 h-4 text-[var(--accent)]" />
            <span>Language and localization</span>
          </h3>

          <div className="space-y-2">
            {langOptions.map((opt) => (
              <label
                key={opt.code}
                className={`flex items-start gap-3 p-3 rounded-[10px] border text-[13px] cursor-pointer transition-colors ${
                  language === opt.code
                    ? 'border-[var(--accent)] bg-[var(--bg)] text-[var(--text)] font-medium'
                    : 'border-[var(--border)] hover:bg-[var(--hover)] text-[var(--muted)]'
                }`}
              >
                <input
                  type="radio"
                  name="app_language"
                  checked={language === opt.code}
                  onChange={() => setLanguage(opt.code)}
                  className="mt-0.5 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                />
                <div>
                  <p className="m-0 font-medium text-[var(--text)]">{opt.label}</p>
                  <p className="text-[12px] text-[var(--muted)] m-0 font-normal">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Legal Confidentiality & Privacy */}
        <Card>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2 mb-2 m-0">
            <ShieldCheck className="w-4 h-4 text-[var(--ok-text)]" />
            <span>Privacy and advocate privilege</span>
          </h3>
          <p className="text-[13px] text-[var(--muted)] leading-relaxed m-0 mb-3">
            All private communications and appointment requests on Lex Hafi Yawe are governed by Law N° 058/2021 relating to the Protection of Personal Data and Privacy. Client-advocate privilege is strictly maintained.
          </p>
          <div className="text-[11px] text-[var(--muted)] bg-[var(--bg)] p-2.5 rounded-[8px] border border-[var(--border)]">
            Account security status: <strong className="text-[var(--text)]">Cryptographically authenticated bearer session</strong>
          </div>
        </Card>
      </div>
    </div>
  );
};
