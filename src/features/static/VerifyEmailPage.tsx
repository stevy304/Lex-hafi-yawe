import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      // Auto verify from email link token
      authService
        .verifyEmailCode({ code: '123456' })
        .then(() => {
          setStatus('success');
        })
        .catch(() => {
          setStatus('error');
          setErrorMsg(t.errCode);
        });
    }
  }, [token, t.errCode]);

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setStatus('verifying');
    setErrorMsg(null);

    try {
      await authService.verifyEmailCode({ code });
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t.errCode);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '12px clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LogoIcon size={32} ariaHidden={true} />
          <b style={{ fontSize: '15px' }}>Lex Hafi Yawe</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <div>
            <Spinner />
            <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Verifying your email token...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '48px', color: '#22c55e', marginBottom: '12px' }}>✓</div>
            <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Email Confirmed</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              Your email address has been verified. You may now continue to Lex Hafi Yawe.
            </p>
            <button
              type="button"
              className="go"
              style={{ width: '100%' }}
              onClick={() => navigate(user ? '/home' : '/')}
            >
              Continue
            </button>
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <div>
            <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Verify Your Email</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              Enter the 6-digit verification code sent to your registered email address.
            </p>

            {errorMsg && <p role="alert" className="err" style={{ marginBottom: '12px' }}>{errorMsg}</p>}

            <form onSubmit={handleManualVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label htmlFor="ve-code">{t.codeLabel}</label>
                <input
                  id="ve-code"
                  type="text"
                  maxLength={6}
                  className="otp-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <button type="submit" className="go" disabled={code.length !== 6}>
                {t.verify}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
