import React, { useState } from 'react';
import {
  X,
  Scale,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  ShieldCheck,
  Award,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openLoginModal,
    openRegisterModal,
    login,
    register,
    users
  } = useApp();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('citizen');
  const [regBarRoll, setRegBarRoll] = useState('');
  const [regFirmName, setRegFirmName] = useState('');
  const [regPracticeAreas, setRegPracticeAreas] = useState('Land & Property Conveyancing, Commercial Law');
  const [regError, setRegError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      setLoginError('Please enter your email or username');
      return;
    }

    const success = login(identifier.trim(), password);
    if (!success) {
      setLoginError('Account not found with this username or email. Check credentials or select a quick demo account below.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim()) {
      setRegError('Please complete all required fields');
      return;
    }

    // Check if username already exists
    const exists = users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase());
    if (exists) {
      setRegError(`Username @${regUsername} is already taken. Please pick another username.`);
      return;
    }

    const parsedAreas = regPracticeAreas.split(',').map(s => s.trim()).filter(Boolean);

    register({
      name: regName.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      role: regRole,
      password: regPassword || 'password123',
      barRollNumber: regRole === 'advocate' ? (regBarRoll.trim() || 'RBA/2026/PROV') : undefined,
      firmName: regRole === 'advocate' ? (regFirmName.trim() || 'Independent Chambers') : undefined,
      practiceAreas: regRole === 'advocate' ? parsedAreas : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#102744] to-[#1D4ED8] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Lex Hafi Yawe</h2>
              <span className="text-[10px] text-blue-200 block">Rwanda Digital Justice Platform</span>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 text-white/70 hover:text-white rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold bg-slate-50">
          <button
            type="button"
            onClick={openLoginModal}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              authModalMode === 'login'
                ? 'border-blue-700 text-blue-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={openRegisterModal}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              authModalMode === 'register'
                ? 'border-blue-700 text-blue-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {authModalMode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. alinemugabo_esq or eric@innovatekigali.rw"
                    className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Sign In to Platform
              </button>

              {/* Quick Demo Access Bar */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                  Quick Demo Access (One-Click)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => login('alinemugabo_esq')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left text-2xs text-slate-800 transition"
                  >
                    <strong className="block font-bold text-blue-950">Me. Aline Mugabo</strong>
                    <span className="text-slate-500">Verified Advocate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('eric_nshimi')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left text-2xs text-slate-800 transition"
                  >
                    <strong className="block font-bold text-slate-900">Eric Nshimiyimana</strong>
                    <span className="text-slate-500">Citizen Entrepreneur</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('minijust_rwanda')}
                    className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-left text-2xs text-slate-800 transition"
                  >
                    <strong className="block font-bold text-amber-950">MINIJUST Official</strong>
                    <span className="text-slate-500">Ministry Publisher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('clarisse_admin')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left text-2xs text-slate-800 transition"
                  >
                    <strong className="block font-bold text-indigo-950">Clarisse (Admin)</strong>
                    <span className="text-slate-500">Platform Moderator</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  I am joining Lex Hafi Yawe as:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`p-2 rounded-xl border text-xs text-left transition ${
                      regRole === 'citizen'
                        ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-700 mb-1" />
                    <span>Citizen / Business</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('advocate')}
                    className={`p-2 rounded-xl border text-xs text-left transition ${
                      regRole === 'advocate'
                        ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700 mb-1" />
                    <span>Legal Advocate (Bar)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Me. Patrick Habimana"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. patrick_rw"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="email@domain.rw"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {regRole === 'advocate' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-blue-950 block mb-1">
                        Bar Roll Number
                      </label>
                      <input
                        type="text"
                        value={regBarRoll}
                        onChange={e => setRegBarRoll(e.target.value)}
                        placeholder="RBA/1890/2023"
                        className="w-full text-xs bg-white border border-blue-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-blue-950 block mb-1">
                        Law Firm / Chambers
                      </label>
                      <input
                        type="text"
                        value={regFirmName}
                        onChange={e => setRegFirmName(e.target.value)}
                        placeholder="Apex Law Chambers"
                        className="w-full text-xs bg-white border border-blue-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-blue-950 block mb-1">
                      Practice Areas (comma separated)
                    </label>
                    <input
                      type="text"
                      value={regPracticeAreas}
                      onChange={e => setRegPracticeAreas(e.target.value)}
                      placeholder="Land Law, Commercial Litigation, Labor"
                      className="w-full text-xs bg-white border border-blue-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {regError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Create Account & Join Platform
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
