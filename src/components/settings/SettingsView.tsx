import React from 'react';
import {
  Settings,
  Globe,
  ShieldCheck,
  Bell,
  RefreshCw,
  User as UserIcon,
  Lock,
  LogOut,
  LogIn,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    users,
    setCurrentUser,
    logout,
    openLoginModal,
    resetDemoData
  } = useApp();
  const t = useTranslation(language);

  const langOptions: { code: Language; label: string; desc: string }[] = [
    { code: 'en', label: 'English', desc: 'Standard business & official legal language in Rwanda' },
    { code: 'rw', label: 'Ikinyarwanda', desc: 'Ururimi kavukire rwa repubulika y\'u Rwanda' },
    { code: 'fr', label: 'Français', desc: 'Langue officielle et juridique du Rwanda' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-700" />
          <h1 className="text-lg font-black text-slate-900">
            Account & Platform Settings
          </h1>
        </div>
        <p className="text-xs text-slate-600">
          Configure localization preferences, confidentiality safeguards, and security settings.
        </p>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl space-y-5">
        {/* Account Session & Authentication Control */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Current Session & Identity</span>
            </h3>

            {currentUser && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active Session
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <UserAvatar user={currentUser} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
                      <VerificationBadge user={currentUser} size="sm" />
                    </div>
                    <p className="text-2xs text-slate-500">@{currentUser.username} • {currentUser.email}</p>
                    <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block mt-0.5">
                      Role: {currentUser.role} {currentUser.barRollNumber ? `(${currentUser.barRollNumber})` : ''}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Switch Persona / Test Role
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setCurrentUser(u)}
                      className={`p-2 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                        u.id === currentUser.id
                          ? 'border-blue-700 bg-blue-50/70 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <UserAvatar user={u} size="xs" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-blue-700" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                You are currently browsing Lex Hafi Yawe in Guest Mode.
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Register Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Language & Localization</span>
          </h3>

          <div className="space-y-2">
            {langOptions.map(opt => (
              <label
                key={opt.code}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                  language === opt.code
                    ? 'border-blue-700 bg-blue-50/60 text-blue-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="app_language"
                  checked={language === opt.code}
                  onChange={() => setLanguage(opt.code)}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p>{opt.label}</p>
                  <p className="text-[11px] text-slate-500 font-normal">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Legal Confidentiality & Privacy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Advocate Privilege</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All private conversations and appointments on Lex Hafi Yawe are governed by Law N° 058/2021 relating to the Protection of Personal Data and Privacy. Client-advocate privilege is strictly preserved.
          </p>
          <div className="text-2xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Current account security level: <strong>Enterprise Law Society Tier (Encrypted)</strong>
          </div>
        </div>

        {/* Demo reset */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Reset Demo Data</h4>
            <p className="text-2xs text-slate-500">
              Restore initial seed posts, verified advocates, and consultations.
            </p>
          </div>
          <button
            onClick={resetDemoData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
