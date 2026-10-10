import React, { useState } from 'react';
import {
  X,
  Scale,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  Building,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { api } from '../../api/client';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openLoginModal,
    openRegisterModal,
    login,
    register,
    isAuthLoading
  } = useApp();

  // Mode: 'login' | 'register' | 'forgot_password' | 'reset_password'
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('citizen');
  const [regBarRoll, setRegBarRoll] = useState('');
  const [regFirmName, setRegFirmName] = useState('');
  const [regPracticeAreas, setRegPracticeAreas] = useState('Land & Property Conveyancing, Commercial Law');
  const [regError, setRegError] = useState('');

  // Password reset flow
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  // Sync mode with prop
  React.useEffect(() => {
    if (authModalMode === 'login' || authModalMode === 'register') {
      setCurrentMode(authModalMode);
    }
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      setLoginError('Please enter your email or username');
      return;
    }
    if (!password) {
      setLoginError('Please enter your password');
      return;
    }

    try {
      const success = await login(identifier.trim(), password);
      if (!success) {
        setLoginError('Invalid credentials. Please verify your username/email and password.');
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication service error. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please complete all required fields');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long');
      return;
    }

    const parsedAreas = regPracticeAreas.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const success = await register({
        name: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim(),
        role: regRole,
        password: regPassword,
        barRollNumber: regRole === 'advocate' ? (regBarRoll.trim() || undefined) : undefined,
        firmName: regRole === 'advocate' ? (regFirmName.trim() || undefined) : undefined,
        practiceAreas: regRole === 'advocate' ? parsedAreas : undefined
      });

      if (!success) {
        setRegError('Unable to create account. Username or email may already be registered.');
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setIsResetSubmitting(true);

    try {
      const res = await api.requestPasswordReset(forgotIdentifier.trim());
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setResetMessage(`Reset authorization verified for ${res.email || forgotIdentifier}. Enter your new password below.`);
        setCurrentMode('reset_password');
      } else {
        setResetError('Unable to find an account with that identifier.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Could not process password reset request.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setIsResetSubmitting(true);

    try {
      const res = await api.resetPassword(resetToken.trim(), newPassword);
      if (res.success) {
        setResetMessage('Password reset successfully. You can now sign in.');
        setTimeout(() => {
          setCurrentMode('login');
          setIdentifier(forgotIdentifier);
          setPassword(newPassword);
        }, 1200);
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const fillQuickCredentials = (userIdent: string, userPass: string) => {
    setIdentifier(userIdent);
    setPassword(userPass);
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Modal Top Header with Brand */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#102744] via-[#163864] to-[#1D4ED8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-tight">Lex Hafi Yawe</h2>
              <span className="text-[11px] text-blue-200 font-medium block">
                Digital Justice & Legal Network • Rwanda
              </span>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        {(currentMode === 'login' || currentMode === 'register') && (
          <div className="flex border-b border-slate-200 text-xs font-bold bg-slate-50/80">
            <button
              type="button"
              onClick={() => { setCurrentMode('login'); openLoginModal(); }}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                currentMode === 'login'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setCurrentMode('register'); openRegisterModal(); }}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                currentMode === 'register'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {currentMode === 'login' && (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Welcome Back</h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Sign in to access verified legal counsel, case files, and official Rwanda justice tools.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

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
                    placeholder="e.g. username or user@domain.rw"
                    className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentMode('forgot_password')}
                    className="text-2xs text-blue-700 hover:text-blue-900 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300"
                  />
                  <span className="text-2xs">Remember session securely</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <span>Sign In to Platform</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-2xs text-slate-500">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setCurrentMode('register'); openRegisterModal(); }}
                    className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </span>
              </div>
            </form>
          )}

          {currentMode === 'register' && (
            /* --- REGISTER FORM --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Join Lex Hafi Yawe</h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Register as a citizen, practicing legal advocate, or authorized justice organization.
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                      regRole === 'citizen'
                        ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="block font-bold text-xs leading-tight">Citizen</span>
                      <span className="text-[10px] text-slate-500">Personal & Business</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('advocate')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                      regRole === 'advocate'
                        ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="block font-bold text-xs leading-tight">Advocate</span>
                      <span className="text-[10px] text-slate-500">Bar roll member</span>
                    </div>
                  </button>
                </div>
                {regRole === 'advocate' && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl mt-2">
                    Note: Advocates start with Pending status until Bar certificate and roll number are verified by platform compliance.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder={regRole === 'advocate' ? 'e.g. Me. Patrick Habimana' : 'e.g. Patrick Habimana'}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
                    placeholder="patrick_habimana"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="patrick@chambers.rw"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              {regRole === 'advocate' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-2xs font-bold text-slate-800 block mb-1">
                        RBA Roll Number
                      </label>
                      <input
                        type="text"
                        required
                        value={regBarRoll}
                        onChange={e => setRegBarRoll(e.target.value)}
                        placeholder="e.g. RBA/1420/2022"
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-bold text-slate-800 block mb-1">
                        Law Firm / Chambers
                      </label>
                      <input
                        type="text"
                        value={regFirmName}
                        onChange={e => setRegFirmName(e.target.value)}
                        placeholder="e.g. Kigali Legal Associates"
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-slate-800 block mb-1">
                      Practice Areas (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={regPracticeAreas}
                      onChange={e => setRegPracticeAreas(e.target.value)}
                      placeholder="e.g. Land Law, Corporate Restructuring"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs border border-slate-300 rounded-xl pl-3 pr-10 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                By joining, you agree to Rwandan legal compliance guidelines and the platform&apos;s privacy safeguards.
              </p>
            </form>
          )}

          {currentMode === 'forgot_password' && (
            /* --- FORGOT PASSWORD FLOW --- */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-700" />
                  <span>Reset Account Password</span>
                </h3>
                <p className="text-2xs text-slate-500 mt-1">
                  Enter your registered username or email address. We will verify your account and issue a secure reset authorization.
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Identifier
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={e => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. username or user@domain.rw"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMode('login')}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {isResetSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Verify Account</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {currentMode === 'reset_password' && (
            /* --- ENTER NEW PASSWORD --- */
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Enter New Password</h3>
                <p className="text-2xs text-slate-500 mt-1">
                  {resetMessage || 'Authorization verified. Choose a strong new password.'}
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isResetSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isResetSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Update & Sign In</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
