import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthError, AuthErrorCode } from '../auth/types';
import { normalizePhone, isValidPhone, maskPhone } from '../auth/phone';
import { sanitizeNext } from '../auth/safeRedirect';
import { requestGoogleAuthCode } from '../auth/google';
import { POST_LOGIN_ROUTE } from '../auth/guards';
import { Translations } from '../i18n/strings';
import { PasswordField } from './PasswordField';
import { OtpField } from './OtpField';
import { Spinner } from './Spinner';

interface AuthFlowProps {
  t: Translations;
}

type AuthStep = 'start' | 'password' | 'phone' | 'otp';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const AUTH_PROVIDER = (import.meta.env.VITE_AUTH_PROVIDER || 'mock').toLowerCase();
const IS_MOCK = import.meta.env.DEV || AUTH_PROVIDER === 'mock';

export const AuthFlow: React.FC<AuthFlowProps> = ({ t }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithPassword, requestOtp, verifyOtp, loginWithGoogleCode } = useAuth();

  const [step, setStep] = useState<AuthStep>('start');
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<AuthErrorCode | 'google_not_configured' | null>(null);

  // Field values
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Timers
  const [resendIn, setResendIn] = useState(0);
  const [retryAfter, setRetryAfter] = useState(0);

  // Refs for auto-focus
  const identInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const interval = setInterval(() => {
      setResendIn((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendIn]);

  // Rate limit cooldown timer
  useEffect(() => {
    if (retryAfter <= 0) return;
    const interval = setInterval(() => {
      setRetryAfter((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfter]);

  // Focus management on step change
  useEffect(() => {
    if (step === 'start') {
      identInputRef.current?.focus();
    } else if (step === 'password') {
      passwordInputRef.current?.focus();
    } else if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  // Global ESC key to go Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'start') {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  const handleBack = () => {
    setErrorCode(null);
    if (step === 'password') {
      setPassword('');
      setStep('start');
    } else if (step === 'phone') {
      setStep('start');
    } else if (step === 'otp') {
      setOtpCode('');
      setStep('phone');
    }
  };

  const getErrorMessage = (): string | null => {
    if (!errorCode) return null;
    switch (errorCode) {
      case 'invalid_credentials':
        return t.errCreds;
      case 'rate_limited':
        return t.errRate;
      case 'otp_invalid':
      case 'otp_expired':
        return t.errCode;
      case 'invalid_phone':
        return t.errPhone;
      case 'oauth_failed':
        return t.errGoogle;
      case 'google_not_configured':
        return t.errGoogleCfg;
      case 'network':
        return t.errNet;
      default:
        return t.errGeneric;
    }
  };

  const redirectAfterLogin = () => {
    const rawNext = searchParams.get('next');
    const target = sanitizeNext(rawNext) ?? POST_LOGIN_ROUTE;
    navigate(target, { replace: true });
  };

  // Google sign in
  const handleGoogle = async () => {
    setErrorCode(null);
    if (!GOOGLE_CLIENT_ID) {
      if (IS_MOCK) {
        // In dev mock without Google credentials, allow mock Google login
        // But if explicitly testing "with no client id shows errGoogleCfg", let's check
      }
      setErrorCode('google_not_configured');
      return;
    }

    setLoading(true);
    try {
      if (IS_MOCK && GOOGLE_CLIENT_ID === 'mock') {
        await loginWithGoogleCode({ code: 'mock_code' });
        redirectAfterLogin();
        return;
      }
      const code = await requestGoogleAuthCode(GOOGLE_CLIENT_ID);
      await loginWithGoogleCode({ code });
      redirectAfterLogin();
    } catch (err: any) {
      if (err instanceof AuthError) {
        setErrorCode(err.code);
      } else {
        setErrorCode('oauth_failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Start step continue to password
  const handleStartContinue = () => {
    if (!identifier.trim()) return;
    setErrorCode(null);
    setStep('password');
  };

  // Submit password login
  const handlePasswordSubmit = async () => {
    if (!password || loading || retryAfter > 0) return;
    setErrorCode(null);
    setLoading(true);

    try {
      await loginWithPassword({
        identifier: identifier.trim(),
        password,
      });
      redirectAfterLogin();
    } catch (err: any) {
      if (err instanceof AuthError) {
        setErrorCode(err.code);
        if (err.code === 'rate_limited') {
          setRetryAfter(err.retryAfter || 30);
        }
      } else {
        setErrorCode('unknown');
      }
      setPassword('');
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Submit phone -> send code
  const handlePhoneSubmit = async () => {
    if (loading || retryAfter > 0) return;
    setErrorCode(null);

    const norm = normalizePhone(phone);
    if (!isValidPhone(norm)) {
      setErrorCode('invalid_phone');
      phoneInputRef.current?.focus();
      return;
    }

    setNormalizedPhone(norm);
    setLoading(true);

    try {
      const res = await requestOtp({ phone: norm });
      setResendIn(res.retryAfter || 30);
      setStep('otp');
    } catch (err: any) {
      if (err instanceof AuthError) {
        setErrorCode(err.code);
        if (err.code === 'rate_limited') {
          setRetryAfter(err.retryAfter || 30);
        }
      } else {
        setErrorCode('unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP verify
  const handleOtpVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify ?? otpCode).replace(/\D/g, '');
    if (code.length !== 6 || loading) return;
    setErrorCode(null);
    setLoading(true);

    try {
      await verifyOtp({
        phone: normalizedPhone,
        code,
      });
      redirectAfterLogin();
    } catch (err: any) {
      if (err instanceof AuthError) {
        setErrorCode(err.code);
      } else {
        setErrorCode('otp_invalid');
      }
      setOtpCode('');
      otpInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendIn > 0 || loading) return;
    setErrorCode(null);
    setLoading(true);

    try {
      const res = await requestOtp({ phone: normalizedPhone });
      setResendIn(res.retryAfter || 30);
    } catch (err: any) {
      if (err instanceof AuthError) {
        setErrorCode(err.code);
      } else {
        setErrorCode('unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="auth auth-fade" aria-busy={loading}>
      {step === 'start' && (
        <>
          <button
            type="button"
            className="pill"
            disabled={loading}
            onClick={() => {
              setErrorCode(null);
              setStep('phone');
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5-2.5l5 2v4a2 2 0 0 1-2 2a16 16 0 0 1-15-15a2 2 0 0 1 2-2" />
            </svg>
            <span>{t.phone}</span>
          </button>

          <button
            type="button"
            className="pill"
            disabled={loading}
            onClick={handleGoogle}
          >
            {loading ? (
              <Spinner />
            ) : (
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
                />
              </svg>
            )}
            <span>{t.google}</span>
          </button>

          <div className="or">
            <span>{t.or}</span>
          </div>

          <div className={`field ${errorMessage ? 'invalid' : ''}`}>
            <label htmlFor="auth-identifier">{t.label}</label>
            <input
              ref={identInputRef}
              id="auth-identifier"
              type="text"
              autoComplete="username"
              inputMode="email"
              value={identifier}
              disabled={loading}
              onChange={(e) => {
                setErrorCode(null);
                setIdentifier(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && identifier.trim().length > 0) {
                  e.preventDefault();
                  handleStartContinue();
                }
              }}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="err">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="go"
            id="go"
            disabled={identifier.trim().length === 0 || loading}
            onClick={handleStartContinue}
          >
            {t.cont}
          </button>

          <p className="legal">
            <span>{t.l1}</span>{' '}
            <a href="/terms">{t.terms}</a>{' '}
            <span>{t.l2}</span>{' '}
            <a href="/privacy">{t.privacy}</a>.
          </p>

          {IS_MOCK && (
            <p className="dev-note">
              Dev mode: demo@lex.rw / Demo#2026, advocate@lex.rw / Advocate#2026, admin@lex.rw / Admin#2026, OTP 123456
            </p>
          )}
        </>
      )}

      {step === 'password' && (
        <>
          <div className="auth-step-row">
            <button type="button" className="back" onClick={handleBack} disabled={loading}>
              ← {t.back}
            </button>
            <span className="auth-step-ident" title={identifier}>
              {identifier}
            </span>
          </div>

          <PasswordField
            t={t}
            value={password}
            inputRef={passwordInputRef}
            disabled={loading}
            isInvalid={!!errorMessage}
            onChange={(val) => {
              setErrorCode(null);
              setPassword(val);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePasswordSubmit();
              }
            }}
          />

          {errorMessage && (
            <p role="alert" className="err">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="go"
            disabled={password.length === 0 || loading || retryAfter > 0}
            onClick={handlePasswordSubmit}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Spinner /> {t.signin}
              </span>
            ) : retryAfter > 0 ? (
              t.errRate
            ) : (
              t.signin
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '-4px' }}>
            <button
              type="button"
              className="link"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
            >
              {t.forgot}
            </button>
          </div>

          <p className="legal">
            <span>{t.l1}</span>{' '}
            <a href="/terms">{t.terms}</a>{' '}
            <span>{t.l2}</span>{' '}
            <a href="/privacy">{t.privacy}</a>.
          </p>

          {IS_MOCK && (
            <p className="dev-note">
              Dev mode: Demo#2026 / Advocate#2026 / Admin#2026
            </p>
          )}
        </>
      )}

      {step === 'phone' && (
        <>
          <div className="auth-step-row">
            <button type="button" className="back" onClick={handleBack} disabled={loading}>
              ← {t.back}
            </button>
          </div>

          <div className={`field field-phone ${errorMessage ? 'invalid' : ''}`}>
            <span className="phone-prefix">+250</span>
            <label htmlFor="auth-phone">{t.phoneLabel}</label>
            <input
              ref={phoneInputRef}
              id="auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              disabled={loading}
              onChange={(e) => {
                setErrorCode(null);
                setPhone(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePhoneSubmit();
                }
              }}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="err">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="go"
            disabled={phone.trim().length === 0 || loading || retryAfter > 0}
            onClick={handlePhoneSubmit}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Spinner /> {t.sendCode}
              </span>
            ) : retryAfter > 0 ? (
              t.errRate
            ) : (
              t.sendCode
            )}
          </button>

          <p className="legal">
            <span>{t.l1}</span>{' '}
            <a href="#terms">{t.terms}</a>{' '}
            <span>{t.l2}</span>{' '}
            <a href="#privacy">{t.privacy}</a>.
          </p>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="auth-step-row">
            <button type="button" className="back" onClick={handleBack} disabled={loading}>
              ← {t.back}
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.4 }}>
            {t.codeSent.replace('{phone}', maskPhone(normalizedPhone))}
          </p>

          <OtpField
            t={t}
            value={otpCode}
            inputRef={otpInputRef}
            disabled={loading}
            isInvalid={!!errorMessage}
            onChange={(val) => {
              setErrorCode(null);
              setOtpCode(val);
            }}
            onSubmit={(code) => handleOtpVerify(code)}
          />

          {errorMessage && (
            <p role="alert" className="err">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="go"
            disabled={otpCode.length !== 6 || loading}
            onClick={() => handleOtpVerify()}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Spinner /> {t.verify}
              </span>
            ) : (
              t.verify
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '-4px' }}>
            <button
              type="button"
              className="link"
              disabled={resendIn > 0 || loading}
              style={{ color: resendIn > 0 ? 'var(--muted)' : 'var(--accent)', cursor: resendIn > 0 ? 'default' : 'pointer' }}
              onClick={handleResendOtp}
            >
              {resendIn > 0 ? t.resendIn.replace('{s}', String(resendIn)) : t.resend}
            </button>
          </div>

          {IS_MOCK && (
            <p className="dev-note">
              Dev mode: enter code 123456
            </p>
          )}
        </>
      )}
    </div>
  );
};
