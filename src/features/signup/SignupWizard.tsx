import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { AuthError } from '../../auth/types';
import { normalizePhone, isValidPhone } from '../../auth/phone';
import { evaluatePasswordStrength } from '../../auth/passwords';
import { sanitizeNext } from '../../auth/safeRedirect';
import { requestGoogleAuthCode } from '../../auth/google';
import { RWANDA_DISTRICTS } from '../../data/districts';
import { LogoIcon } from '../../components/LogoIcon';
import { LogoHeroOutline } from '../../components/LogoHeroOutline';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { FeatureChips } from '../../components/FeatureChips';
import { QrCard } from '../../components/QrCard';
import { Spinner } from '../../components/Spinner';
import { AvatarCropper } from './AvatarCropper';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const IS_MOCK = import.meta.env.DEV || (import.meta.env.VITE_AUTH_PROVIDER || 'mock') === 'mock';

export const SignupWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');
  const rawNext = searchParams.get('next');
  const { user, loginWithGoogleCode, requestOtp, verifyOtp, registerEmail, verifyEmailCode, updateUser } = useAuth();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  // Step state: 1 (method), 2 (phone or email verify), 3 (profile), 4 (consent)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (location.pathname.includes('/profile')) return 3;
    if (location.pathname.includes('/consent')) return 4;
    return 1;
  });

  const [signupMethod, setSignupMethod] = useState<'phone' | 'email' | 'google' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone inputs
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Email inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');

  // Profile inputs
  const [fullName, setFullName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [handleSuggestions, setHandleSuggestions] = useState<string[]>([]);
  const [district, setDistrict] = useState(user?.district || 'Gasabo');
  const [accountType, setAccountType] = useState<'citizen' | 'advocate' | 'institution'>(
    intent === 'advocate' ? 'advocate' : 'citizen'
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);

  // Consent inputs
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  const [updatesOptIn, setUpdatesOptIn] = useState(false);
  const [digestOptIn, setDigestOptIn] = useState(false);

  // Debounced handle check
  useEffect(() => {
    if (currentStep !== 3 || !handle.trim()) {
      setHandleStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setHandleStatus('checking');
      const res = await authService.checkHandleAvailable(handle);
      if (res.available) {
        setHandleStatus('available');
        setHandleSuggestions([]);
      } else {
        setHandleStatus('taken');
        setHandleSuggestions(res.suggestions || []);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, currentStep]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const interval = setInterval(() => {
      setResendIn((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendIn]);

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setError(null);
    if (!GOOGLE_CLIENT_ID) {
      if (!IS_MOCK) {
        setError(t.errGoogleCfg);
        return;
      }
    }

    setLoading(true);
    try {
      const code = IS_MOCK && (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'mock')
        ? 'mock_code'
        : await requestGoogleAuthCode(GOOGLE_CLIENT_ID);

      const res = await loginWithGoogleCode({ code });
      if (res.user.name) setFullName(res.user.name);
      if (res.user.avatarUrl) setAvatarUrl(res.user.avatarUrl);
      setCurrentStep(3);
    } catch (err: any) {
      setError(t.errGoogle);
    } finally {
      setLoading(false);
    }
  };

  // Phone send code
  const handlePhoneSendCode = async () => {
    setError(null);
    const norm = normalizePhone(phone);
    if (!isValidPhone(norm)) {
      setError(t.errPhone);
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp({ phone: norm });
      setResendIn(res.retryAfter || 30);
      setPhoneCodeSent(true);
    } catch {
      setError(t.errNet);
    } finally {
      setLoading(false);
    }
  };

  // Phone verify
  const handlePhoneVerify = async () => {
    if (phoneCode.length !== 6) return;
    setError(null);
    setLoading(true);

    try {
      const norm = normalizePhone(phone);
      const res = await verifyOtp({ phone: norm, code: phoneCode });
      if (res.isNewUser) {
        setCurrentStep(3);
      } else {
        const next = sanitizeNext(rawNext) ?? '/home';
        navigate(next, { replace: true });
      }
    } catch (err: any) {
      setError(t.errCode);
    } finally {
      setLoading(false);
    }
  };

  // Email submit credentials
  const handleEmailSubmitCredentials = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    const pwCheck = evaluatePasswordStrength(password, trimmedEmail);
    if (!pwCheck.isValid) {
      setError(pwCheck.hint || 'Password does not meet security criteria');
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      await registerEmail({ email: trimmedEmail, password });
      setEmailCodeSent(true);
      setResendIn(30);
    } catch {
      setError(t.errNet);
    } finally {
      setLoading(false);
    }
  };

  // Email verify
  const handleEmailVerify = async () => {
    if (emailCode.length !== 6) return;
    setError(null);
    setLoading(true);

    try {
      await verifyEmailCode({ code: emailCode, email: email.trim().toLowerCase() });
      setCurrentStep(3);
    } catch {
      setError(t.errCode);
    } finally {
      setLoading(false);
    }
  };

  // Profile submit
  const handleProfileSubmit = async () => {
    setError(null);
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(handle.trim())) {
      setError('Handle must be 3-20 lowercase alphanumeric characters or underscores');
      return;
    }
    if (handleStatus === 'taken') {
      setError(t.handleTaken);
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        name: fullName.trim(),
        handle: handle.trim(),
        district,
        avatarUrl,
      });
      await authService.updateOnboarding({
        step: 'consent',
        name: fullName.trim(),
        handle: handle.trim(),
        district,
        accountType,
        avatarUrl,
      });
      setCurrentStep(4);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  // Consent submit
  const handleConsentSubmit = async () => {
    setError(null);
    if (!agreeTerms || !confirmAge) {
      setError('You must accept the terms and confirm your age to proceed');
      return;
    }

    setLoading(true);
    try {
      await authService.submitConsent({
        termsVersion: 'v2026.1',
        privacyVersion: 'v2026.1',
        ageConfirmed: true,
        marketing: { updates: updatesOptIn, digest: digestOptIn },
      });

      if (intent === 'advocate' || accountType === 'advocate') {
        navigate('/apply', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = evaluatePasswordStrength(password, email);

  return (
    <div className="page">
      <main className="left">
        {/* Top bar */}
        <div className="top">
          <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <LogoIcon size={38} ariaHidden={true} />
            <div>
              <b>Lex Hafi Yawe</b>
              <span>{t.tag}</span>
            </div>
          </div>
          <div className="ctrls">
            <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
            <ThemeToggle onToggle={toggleTheme} />
          </div>
        </div>

        {/* Wizard container */}
        <div className="mid" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vh, 18px)' }}>
          {/* Progress dots & counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>
              {t.stepOf.replace('{current}', String(currentStep)).replace('{total}', '5')}
            </span>
            <div style={{ display: 'flex', gap: '6px' }} aria-label="Progress">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  aria-current={s === currentStep ? 'step' : undefined}
                  style={{
                    width: s === currentStep ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: s <= currentStep ? 'var(--accent)' : 'var(--border)',
                    transition: 'all .2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Choose Method */}
          {currentStep === 1 && (
            <div className="auth auth-fade">
              <h1 style={{ fontSize: 'clamp(28px, 4.5vh, 40px)', margin: '0 0 6px 0' }}>{t.create}</h1>
              <p className="sub" style={{ margin: '0 0 12px 0' }}>
                {t.alreadyHaveAccount.split('?')[0]}?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => navigate('/')}
                >
                  {t.signin}
                </button>
              </p>

              {error && <p role="alert" className="err">{error}</p>}

              <button
                type="button"
                className="pill"
                onClick={() => {
                  setSignupMethod('phone');
                  setCurrentStep(2);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5-2.5l5 2v4a2 2 0 0 1-2 2a16 16 0 0 1-15-15a2 2 0 0 1 2-2" />
                </svg>
                <span>{t.phone}</span>
              </button>

              <button
                type="button"
                className="pill"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" />
                    <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" />
                  </svg>
                )}
                <span>{t.google}</span>
              </button>

              <button
                type="button"
                className="pill"
                onClick={() => {
                  setSignupMethod('email');
                  setCurrentStep(2);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>{t.continueEmail}</span>
              </button>

              <p className="legal" style={{ marginTop: '8px' }}>
                <span>{t.l1}</span> <a href="/terms">{t.terms}</a> <span>{t.l2}</span> <a href="/privacy">{t.privacy}</a>.
              </p>
            </div>
          )}

          {/* STEP 2a: Phone Method */}
          {currentStep === 2 && signupMethod === 'phone' && (
            <div className="auth auth-fade">
              <button
                type="button"
                className="back"
                onClick={() => {
                  if (phoneCodeSent) setPhoneCodeSent(false);
                  else setCurrentStep(1);
                }}
              >
                ← {t.back}
              </button>

              <h1 style={{ fontSize: 'clamp(24px, 4vh, 34px)', margin: '4px 0' }}>{t.phoneLabel}</h1>

              {error && <p role="alert" className="err">{error}</p>}

              {!phoneCodeSent ? (
                <>
                  <div className="field field-phone">
                    <span className="phone-prefix">+250</span>
                    <label htmlFor="sp-phone">{t.phoneLabel}</label>
                    <input
                      id="sp-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => {
                        setError(null);
                        setPhone(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePhoneSendCode()}
                    />
                  </div>

                  <button
                    type="button"
                    className="go"
                    disabled={!phone.trim() || loading}
                    onClick={handlePhoneSendCode}
                  >
                    {loading ? <Spinner /> : t.sendCode}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    {t.codeSent.replace('{phone}', phone)}
                  </p>

                  <div className="field">
                    <label htmlFor="sp-otp">{t.codeLabel}</label>
                    <input
                      id="sp-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="otp-input"
                      value={phoneCode}
                      onChange={(e) => {
                        setError(null);
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPhoneCode(v);
                        if (v.length === 6) {
                          // Auto submit
                          setTimeout(() => handlePhoneVerify(), 50);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="go"
                    disabled={phoneCode.length !== 6 || loading}
                    onClick={handlePhoneVerify}
                  >
                    {loading ? <Spinner /> : t.verify}
                  </button>

                  <button
                    type="button"
                    className="link"
                    disabled={resendIn > 0}
                    style={{ textAlign: 'center', marginTop: '-4px' }}
                    onClick={handlePhoneSendCode}
                  >
                    {resendIn > 0 ? t.resendIn.replace('{s}', String(resendIn)) : t.resend}
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 2b: Email Method */}
          {currentStep === 2 && signupMethod === 'email' && (
            <div className="auth auth-fade">
              <button
                type="button"
                className="back"
                onClick={() => {
                  if (emailCodeSent) setEmailCodeSent(false);
                  else setCurrentStep(1);
                }}
              >
                ← {t.back}
              </button>

              <h1 style={{ fontSize: 'clamp(24px, 4vh, 34px)', margin: '4px 0' }}>
                {emailCodeSent ? t.codeLabel : t.continueEmail}
              </h1>

              {error && <p role="alert" className="err">{error}</p>}

              {!emailCodeSent ? (
                <>
                  <div className="field">
                    <label htmlFor="se-email">{t.label}</label>
                    <input
                      id="se-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setError(null);
                        setEmail(e.target.value);
                      }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="se-password">{t.password}</label>
                    <input
                      id="se-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setError(null);
                        setPassword(e.target.value);
                      }}
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      className="eye"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? t.hidePw : t.showPw}
                    >
                      {showPassword ? '👁️' : '🔒'}
                    </button>
                  </div>

                  {/* Password strength segments */}
                  {password.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '-4px 0 4px 0' }}>
                      <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            style={{
                              flex: 1,
                              borderRadius: '2px',
                              background:
                                seg <= pwStrength.score
                                  ? pwStrength.score >= 3
                                    ? '#22c55e'
                                    : '#f59e0b'
                                  : 'var(--border)',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: pwStrength.isValid ? '#22c55e' : 'var(--muted)' }}>
                        {pwStrength.isValid ? 'Strong password' : pwStrength.hint}
                      </span>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="se-confirm">{t.confirmPassword}</label>
                    <input
                      id="se-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setError(null);
                        setConfirmPassword(e.target.value);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="go"
                    disabled={!email || !password || !confirmPassword || loading}
                    onClick={handleEmailSubmitCredentials}
                  >
                    {loading ? <Spinner /> : t.cont}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    {t.checkEmailCode.replace('{email}', email)}
                  </p>

                  <div className="field">
                    <label htmlFor="se-otp">{t.codeLabel}</label>
                    <input
                      id="se-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="otp-input"
                      value={emailCode}
                      onChange={(e) => {
                        setError(null);
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setEmailCode(v);
                        if (v.length === 6) {
                          setTimeout(() => handleEmailVerify(), 50);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="go"
                    disabled={emailCode.length !== 6 || loading}
                    onClick={handleEmailVerify}
                  >
                    {loading ? <Spinner /> : t.verify}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="link"
                      onClick={() => setEmailCodeSent(false)}
                    >
                      {t.useDifferentEmail}
                    </button>

                    <button
                      type="button"
                      className="link"
                      disabled={resendIn > 0}
                      onClick={handleEmailSubmitCredentials}
                    >
                      {resendIn > 0 ? t.resendIn.replace('{s}', String(resendIn)) : t.resend}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Profile */}
          {currentStep === 3 && (
            <div className="auth auth-fade" style={{ maxWidth: '580px' }}>
              <h1 style={{ fontSize: 'clamp(24px, 4vh, 32px)', margin: '0' }}>{t.profile}</h1>

              {error && <p role="alert" className="err">{error}</p>}

              <AvatarCropper
                t={t}
                currentAvatarUrl={avatarUrl}
                onAvatarSelected={(url) => setAvatarUrl(url)}
              />

              <div className="field">
                <label htmlFor="sp-fullname">{t.fullName}</label>
                <input
                  id="sp-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setError(null);
                    setFullName(e.target.value);
                  }}
                />
              </div>

              <div>
                <div className={`field ${handleStatus === 'taken' ? 'invalid' : ''}`}>
                  <label htmlFor="sp-handle">{t.handle}</label>
                  <input
                    id="sp-handle"
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setError(null);
                      setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    }}
                  />
                  {handleStatus === 'checking' && (
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                      <Spinner />
                    </span>
                  )}
                  {handleStatus === 'available' && (
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '14px' }}>
                      ✓
                    </span>
                  )}
                </div>

                {handleStatus === 'taken' && (
                  <div style={{ marginTop: '4px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--danger)' }}>{t.handleTaken}</p>
                    {handleSuggestions.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--muted)' }}>{t.suggestions}:</span>
                        {handleSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            className="link"
                            style={{ fontWeight: 600 }}
                            onClick={() => setHandle(sug)}
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="sp-district">{t.district}</label>
                <select
                  id="sp-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    padding: '24px 15px 6px',
                    border: 0,
                    outline: 0,
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '16px',
                  }}
                >
                  {RWANDA_DISTRICTS.map((d) => (
                    <option key={d} value={d} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Type Radio Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>{t.accountType}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAccountType('citizen')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${accountType === 'citizen' ? 'var(--accent)' : 'var(--border)'}`,
                      background: accountType === 'citizen' ? 'rgba(210,105,30,0.1)' : 'var(--surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text)',
                    }}
                  >
                    <b style={{ display: 'block', fontSize: '13px' }}>👤 Citizen</b>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Legal help & guidance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('advocate')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${accountType === 'advocate' ? 'var(--accent)' : 'var(--border)'}`,
                      background: accountType === 'advocate' ? 'rgba(210,105,30,0.1)' : 'var(--surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text)',
                    }}
                  >
                    <b style={{ display: 'block', fontSize: '13px' }}>⚖️ Advocate</b>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Bar member in Rwanda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('institution')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${accountType === 'institution' ? 'var(--accent)' : 'var(--border)'}`,
                      background: accountType === 'institution' ? 'rgba(210,105,30,0.1)' : 'var(--surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text)',
                    }}
                  >
                    <b style={{ display: 'block', fontSize: '13px' }}>🏛️ Institution</b>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Government or NGO</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="go"
                disabled={!fullName.trim() || !handle.trim() || handleStatus === 'taken' || loading}
                onClick={handleProfileSubmit}
              >
                {loading ? <Spinner /> : t.cont}
              </button>
            </div>
          )}

          {/* STEP 4: Consent */}
          {currentStep === 4 && (
            <div className="auth auth-fade">
              <button
                type="button"
                className="back"
                onClick={() => setCurrentStep(3)}
              >
                ← {t.back}
              </button>

              <h1 style={{ fontSize: 'clamp(24px, 4vh, 32px)', margin: '0' }}>{t.agreeTerms}</h1>

              {error && <p role="alert" className="err">{error}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>
                    {t.agreeTerms} (<a href="/terms" target="_blank" rel="noreferrer">{t.terms}</a> & <a href="/privacy" target="_blank" rel="noreferrer">{t.privacy}</a>)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={confirmAge}
                    onChange={(e) => setConfirmAge(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>{t.confirmAge.replace('{minAge}', '16')}</span>
                </label>

                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={updatesOptIn}
                    onChange={(e) => setUpdatesOptIn(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>{t.updatesOptIn}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={digestOptIn}
                    onChange={(e) => setDigestOptIn(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>{t.digestOptIn}</span>
                </label>
              </div>

              <button
                type="button"
                className="go"
                disabled={!agreeTerms || !confirmAge || loading}
                onClick={handleConsentSubmit}
              >
                {loading ? <Spinner /> : t.cont}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="foot">
          <a href="/about">{t.about}</a>
          <a href="/help">{t.help}</a>
          <a href="/terms">{t.terms2}</a>
          <a href="/privacy">{t.privacy2}</a>
          <span>© 2026 Lex Hafi Yawe</span>
        </div>
      </main>

      <aside className="hero" aria-hidden="true">
        <LogoHeroOutline />
        <FeatureChips t={t} />
        <QrCard t={t} />
      </aside>
    </div>
  );
};
