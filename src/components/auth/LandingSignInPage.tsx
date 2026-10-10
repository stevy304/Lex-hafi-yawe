import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Globe,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  AlertCircle,
  Building,
  Award,
  FileText,
  Check,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface LandingSignInPageProps {
  onContinueAsGuest?: () => void;
}

export const LandingSignInPage: React.FC<LandingSignInPageProps> = ({ onContinueAsGuest }) => {
  const {
    login,
    register,
    language,
    setLanguage,
    setIsGuestBrowsing
  } = useApp();

  // Theme: 'dark' (default from source of truth) or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('lex_hafi_landing_theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // View state: 'actions' (default hero options), 'signin', 'signup'
  const [authView, setAuthView] = useState<'actions' | 'signin' | 'signup'>('actions');

  // Sign In state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('citizen');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Quick Demo Login feedback
  const [demoLoadingUser, setDemoLoadingUser] = useState<string | null>(null);

  // Toggle theme
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('lex_hafi_landing_theme', next);
    } catch {}
  };

  const handleGuestExplore = () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    } else {
      setIsGuestBrowsing(true);
    }
  };

  // Sign In submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your email or username');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password');
      return;
    }

    try {
      setLoginLoading(true);
      const success = await login(loginIdentifier.trim(), loginPassword);
      if (!success) {
        setLoginError('Invalid credentials. Please verify your username/email and password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign Up submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!name.trim()) {
      setSignupError('Please provide your full legal name');
      return;
    }
    if (!username.trim()) {
      setSignupError('Please choose a username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSignupError('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSignupLoading(true);
      const success = await register({
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        email: email.trim().toLowerCase(),
        role,
        password
      });

      if (!success) {
        setSignupError('Registration could not be completed. The username or email might already be registered.');
      }
    } catch (err: any) {
      setSignupError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  // One-click demo login helper
  const handleQuickDemoLogin = async (identifier: string, pass: string, label: string) => {
    setDemoLoadingUser(label);
    setLoginError('');
    try {
      await login(identifier, pass);
    } catch (err: any) {
      setLoginError(err.message || `Demo login for ${label} failed`);
    } finally {
      setDemoLoadingUser(null);
    }
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen w-full relative overflow-x-hidden transition-colors duration-200 select-none ${
        theme === 'light'
          ? 'bg-[#FBF8F1] text-[#0B1F3A]'
          : 'bg-[#000000] text-[#E7E9EA]'
      }`}
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial glow on the left / center */}
        <div
          className={`absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[140px] opacity-25 ${
            theme === 'light' ? 'bg-[#D2691E]/20' : 'bg-[#D2691E]/15'
          }`}
        />
        <div
          className={`absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 ${
            theme === 'light' ? 'bg-[#1E3A5F]/15' : 'bg-[#1E3A5F]/20'
          }`}
        />
        {/* Subtle geometric dot matrix grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(420px,1fr)] max-w-[1480px] mx-auto">
        
        {/* ================= LEFT COLUMN: INSTITUTIONAL BRAND HERO ================= */}
        <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 lg:border-r border-white/10 dark:border-white/10 lg:border-[#DAD5C8]/70">
          {/* Top Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#45525A] to-[#242C31] border border-white/15 flex items-center justify-center shadow-lg shadow-black/20">
                <Scale className="w-6 h-6 text-[#D2691E]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-lg uppercase">
                    Lex Hafi Yawe
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D2691E]/15 text-[#D2691E] border border-[#D2691E]/30 tracking-wider">
                    RWANDA
                  </span>
                </div>
                <p className="text-[11px] font-medium opacity-65 tracking-wide">
                  Amategeko Hafi Yawe · Digital Justice
                </p>
              </div>
            </div>

            {/* Mobile Top Controls (Theme & Lang) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl border border-white/10 dark:border-white/10 hover:bg-white/5 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#D2691E]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0B1F3A]" />
                )}
              </button>
              <button
                onClick={handleGuestExplore}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D2691E]/40 text-[#D2691E] hover:bg-[#D2691E]/10 transition"
              >
                Explore
              </button>
            </div>
          </div>

          {/* Centerpiece Hero Emblem & Statement */}
          <div className="my-10 lg:my-auto max-w-xl">
            {/* Government & Judicial Affiliation Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 dark:bg-white/5 border border-white/15 dark:border-white/15 text-xs font-medium mb-6 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#C9A24B] font-semibold">Republic of Rwanda</span>
              <span className="opacity-40">|</span>
              <span className="opacity-80">IECMS Integrated Justice Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-5">
              Justice, Law & Counsel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2691E] via-[#E07A2E] to-[#C9A24B]">
                Within Your Reach.
              </span>
            </h1>

            <p className="text-base sm:text-lg opacity-75 font-normal leading-relaxed mb-8 max-w-lg">
              Rwanda&apos;s authoritative digital justice network. Connect directly with certified
              advocates, read official gazettes, participate in legal consultations, and access free MAJ legal assistance.
            </p>

            {/* Institutional Trust Badges Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] border border-white/10 dark:border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <ShieldCheck className="w-5 h-5 text-[#D2691E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold leading-tight">450+ Verified Advocates</h2>
                  <p className="text-[11px] opacity-60 mt-0.5">Rwanda Bar Association (RBA) roll</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] border border-white/10 dark:border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <Building className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold leading-tight">IECMS Court Synchronized</h2>
                  <p className="text-[11px] opacity-60 mt-0.5">Real-time case law & gazettes</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] border border-white/10 dark:border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <Award className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold leading-tight">MAJ Free Legal Aid</h2>
                  <p className="text-[11px] opacity-60 mt-0.5">Available across all 30 districts</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] border border-white/10 dark:border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <FileText className="w-5 h-5 text-[#D2691E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold leading-tight">Law N° 058/2021 Compliant</h2>
                  <p className="text-[11px] opacity-60 mt-0.5">Full confidentiality & encryption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Meta */}
          <div className="hidden lg:flex items-center gap-6 text-xs opacity-50 pt-6">
            <span>Kigali, Rwanda (CAT)</span>
            <span>•</span>
            <span>Ministry of Justice Partner</span>
            <span>•</span>
            <span>Official Legal Knowledge Graph</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AUTH ACTIONS & FORMS ================= */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          {/* Top Desktop Controls */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 dark:border-white/10">
              <Globe className="w-3.5 h-3.5 ml-2 opacity-50" />
              {(['en', 'rw', 'fr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                    language === l
                      ? 'bg-[#D2691E] text-white'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Theme Toggle & Guest Link */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 dark:border-white/10 hover:bg-white/5 transition text-xs font-medium cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#D2691E]" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#0B1F3A]" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGuestExplore}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#D2691E]/30 text-[#D2691E] hover:bg-[#D2691E]/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse as Guest</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Action Content Area */}
          <div className="w-full max-w-[440px] mx-auto my-auto py-4">
            
            {/* ---------------- VIEW 1: DEFAULT HERO ACTION BUTTONS ---------------- */}
            {authView === 'actions' && (
              <div className="space-y-7 animate-in fade-in duration-200">
                {/* Massive Typography */}
                <div className="space-y-3">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                    Happening now
                  </h2>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight opacity-90">
                    Join today.
                  </h3>
                </div>

                {/* SSO Buttons */}
                <div className="space-y-3 pt-2">
                  {/* Google SSO Button */}
                  <button
                    onClick={() => handleQuickDemoLogin('bosco@kigalibiz.rw', 'CitizenPassword123!', 'Google SSO')}
                    disabled={demoLoadingUser !== null}
                    className="w-full py-3 px-4 rounded-full bg-white text-[#0F1419] hover:bg-[#E6E7E8] font-semibold text-sm transition flex items-center justify-center gap-3 shadow-sm border border-transparent cursor-pointer"
                  >
                    {demoLoadingUser === 'Google SSO' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F1419]" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Sign up with Google</span>
                  </button>

                  {/* Apple SSO Button */}
                  <button
                    onClick={() => handleQuickDemoLogin('uwase@rwandabar.org.rw', 'UwaseLaw2026!', 'Apple SSO')}
                    disabled={demoLoadingUser !== null}
                    className="w-full py-3 px-4 rounded-full bg-white text-[#0F1419] hover:bg-[#E6E7E8] font-semibold text-sm transition flex items-center justify-center gap-3 shadow-sm border border-transparent cursor-pointer"
                  >
                    {demoLoadingUser === 'Apple SSO' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F1419]" />
                    ) : (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.96-14.42-6.53-9.92-11.75-21.46-15.66-34.62-3.91-13.16-5.87-25.13-5.87-35.91 0-14.8 3.59-27.14 10.77-37.03 7.18-9.89 16.27-14.93 27.27-15.14 4.57 0 9.79 1.16 15.66 3.48 5.87 2.33 9.78 3.59 11.74 3.79 1.52-.2 5.54-1.46 12.06-3.79 6.53-2.32 11.85-3.38 15.98-3.17 12.18.63 21.96 5.38 29.35 14.26-10.76 6.53-16.03 15.66-15.82 27.38.21 9.37 3.8 17.15 10.77 23.34 6.96 6.2 15.01 9.89 24.14 11.07-2.17 6.74-4.79 13.7-7.84 20.89zM119.22 31.05c0-7.18 2.61-13.81 7.83-19.89 5.22-6.09 11.74-9.9 19.57-11.41.21 1.09.32 2.07.32 2.94 0 7.17-2.72 13.91-8.15 20.21-5.44 6.3-12.07 9.89-19.89 10.76-.22-.87-.33-1.74-.33-2.61z" />
                      </svg>
                    )}
                    <span>Sign up with Apple</span>
                  </button>

                  {/* IECMS / Rwanda National Justice SSO */}
                  <button
                    onClick={() => handleQuickDemoLogin('admin@lexhafi.rw', 'AdminPassword123!', 'IECMS SSO')}
                    disabled={demoLoadingUser !== null}
                    className="w-full py-3 px-4 rounded-full bg-white/5 dark:bg-white/5 border border-white/20 dark:border-white/20 hover:bg-white/10 font-semibold text-sm transition flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {demoLoadingUser === 'IECMS SSO' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D2691E]" />
                    ) : (
                      <Scale className="w-4 h-4 text-[#D2691E]" />
                    )}
                    <span>Sign up with IECMS / e-Gov</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/15 dark:bg-white/15" />
                  <span className="text-xs font-semibold opacity-60 uppercase">or</span>
                  <div className="flex-1 h-px bg-white/15 dark:bg-white/15" />
                </div>

                {/* Create Account Primary Button */}
                <div className="space-y-3">
                  <button
                    onClick={() => setAuthView('signup')}
                    className="w-full py-3 px-4 rounded-full bg-[#D2691E] hover:bg-[#E07A2E] text-white font-bold text-sm transition shadow-lg shadow-[#D2691E]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] leading-relaxed opacity-60">
                    By signing up, you agree to the{' '}
                    <span className="text-[#D2691E] hover:underline cursor-pointer">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-[#D2691E] hover:underline cursor-pointer">
                      Privacy Policy
                    </span>
                    , including Cookie Use and Rwanda Law N° 058/2021 on Personal Data Protection.
                  </p>
                </div>

                {/* Already have an account? Sign In block */}
                <div className="pt-6 border-t border-white/10 dark:border-white/10 space-y-3">
                  <h4 className="text-base font-bold">Already have an account?</h4>
                  <button
                    onClick={() => setAuthView('signin')}
                    className="w-full py-2.5 px-4 rounded-full border border-white/25 dark:border-white/25 hover:bg-white/5 text-[#D2691E] font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign in</span>
                  </button>
                </div>

                {/* Quick 1-Click Evaluator Demo Accounts Banner */}
                <div className="p-4 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] border border-white/10 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                    <span className="text-xs font-bold text-[#C9A24B]">
                      Instant Demo Role Access
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickDemoLogin('bosco@kigalibiz.rw', 'CitizenPassword123!', 'Citizen')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#D2691E]/15 border border-white/10 hover:border-[#D2691E]/40 text-center transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold">Citizen</div>
                      <div className="text-[9px] opacity-60">Bosco M.</div>
                    </button>
                    <button
                      onClick={() => handleQuickDemoLogin('uwase@rwandabar.org.rw', 'UwaseLaw2026!', 'Advocate')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#D2691E]/15 border border-white/10 hover:border-[#D2691E]/40 text-center transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold">Advocate</div>
                      <div className="text-[9px] opacity-60">Me. Uwase</div>
                    </button>
                    <button
                      onClick={() => handleQuickDemoLogin('admin@lexhafi.rw', 'AdminPassword123!', 'Admin')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#D2691E]/15 border border-white/10 hover:border-[#D2691E]/40 text-center transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold">Admin</div>
                      <div className="text-[9px] opacity-60">Clarisse</div>
                    </button>
                  </div>
                </div>

                {/* Guest Browsing Link */}
                <div className="text-center pt-2">
                  <button
                    onClick={handleGuestExplore}
                    className="text-xs font-medium opacity-70 hover:opacity-100 hover:underline transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span>Or browse public feed without an account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- VIEW 2: SIGN IN FORM ---------------- */}
            {authView === 'signin' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setAuthView('actions')}
                    className="flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-bold text-[#D2691E] uppercase tracking-wider">
                    Sign in to Lex
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs opacity-65">
                    Enter your email or username to access your legal dashboard.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Identifier */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold opacity-80 block">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="you@domain.rw or username"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold opacity-80 block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('bosco@kigalibiz.rw');
                          setLoginPassword('CitizenPassword123!');
                        }}
                        className="text-[11px] text-[#D2691E] hover:underline cursor-pointer"
                      >
                        Auto-fill demo
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type={loginShowPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                      >
                        {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none opacity-80">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 text-[#D2691E] focus:ring-[#D2691E]"
                      />
                      <span>Remember this device</span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 rounded-full bg-[#D2691E] hover:bg-[#E07A2E] text-white font-bold text-sm transition shadow-lg shadow-[#D2691E]/25 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {loginLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <span className="text-xs opacity-65">Don&apos;t have an account? </span>
                  <button
                    onClick={() => setAuthView('signup')}
                    className="text-xs font-bold text-[#D2691E] hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- VIEW 3: CREATE ACCOUNT FORM ---------------- */}
            {authView === 'signup' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setAuthView('actions')}
                    className="flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-bold text-[#D2691E] uppercase tracking-wider">
                    Create account
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Join Lex Hafi Yawe
                  </h2>
                  <p className="text-xs opacity-65">
                    Create your profile to access Rwandan law, counsel, and community.
                  </p>
                </div>

                {signupError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold opacity-80 block">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jean Pierre Nshimiyimana"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Username & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold opacity-80 block">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. jp_nshimi"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold opacity-80 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jp@example.rw"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold opacity-80 block">
                      Platform Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('citizen')}
                        className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                          role === 'citizen'
                            ? 'border-[#D2691E] bg-[#D2691E]/15 text-[#D2691E] font-bold'
                            : 'border-white/15 bg-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Citizen</span>
                          {role === 'citizen' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-[10px] opacity-60 font-normal">Public access</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('advocate')}
                        className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                          role === 'advocate'
                            ? 'border-[#D2691E] bg-[#D2691E]/15 text-[#D2691E] font-bold'
                            : 'border-white/15 bg-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Advocate</span>
                          {role === 'advocate' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-[10px] opacity-60 font-normal">RBA Member</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('institution')}
                        className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                          role === 'institution'
                            ? 'border-[#D2691E] bg-[#D2691E]/15 text-[#D2691E] font-bold'
                            : 'border-white/15 bg-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Institution</span>
                          {role === 'institution' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-[10px] opacity-60 font-normal">Legal Bureau</div>
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold opacity-80 block">
                      Choose Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-2 rounded-xl bg-black/40 dark:bg-black/40 border border-white/20 dark:border-white/20 text-sm focus:outline-hidden focus:border-[#D2691E] transition placeholder:opacity-40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full py-3 px-4 rounded-full bg-[#D2691E] hover:bg-[#E07A2E] text-white font-bold text-sm transition shadow-lg shadow-[#D2691E]/25 flex items-center justify-center gap-2 mt-3 cursor-pointer"
                  >
                    {signupLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1">
                  <span className="text-xs opacity-65">Already have an account? </span>
                  <button
                    onClick={() => setAuthView('signin')}
                    className="text-xs font-bold text-[#D2691E] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Bottom Note */}
          <div className="text-center text-[11px] opacity-40 py-2">
            Secure Rwandan Legal Infrastructure · Protected under Law N° 058/2021
          </div>
        </div>
      </div>

      {/* ================= FOOTER LINKS ROW ================= */}
      <footer className="w-full border-t border-white/10 dark:border-white/10 py-4 px-6 text-[12px] opacity-60">
        <div className="max-w-[1480px] mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
          <a href="#about" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">About</a>
          <a href="#help" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Help Center</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Terms of Service</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Privacy Policy</a>
          <a href="#cookie" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Cookie Policy</a>
          <a href="#accessibility" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Accessibility</a>
          <a href="#iecms" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">IECMS Integration</a>
          <a href="#rba" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Rwanda Bar Association</a>
          <a href="#maj" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Legal Aid (MAJ)</a>
          <a href="#directory" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Advocates Directory</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Legal Gazettes</a>
          <a href="#careers" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">Careers</a>
          <a href="#status" onClick={(e) => { e.preventDefault(); handleGuestExplore(); }} className="hover:opacity-100 hover:underline">System Status</a>
          <span>© 2026 Lex Hafi Yawe Ltd.</span>
        </div>
      </footer>
    </div>
  );
};
