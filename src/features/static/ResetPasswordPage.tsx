import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { evaluatePasswordStrength } from '../../auth/passwords';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock_reset_token';
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const strength = evaluatePasswordStrength(password);
    if (!strength.isValid) {
      setError(strength.hint || 'Password does not meet complexity requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
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

      <main style={{ maxWidth: '440px', margin: '0 auto', padding: '60px 20px' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: '#22c55e', marginBottom: '12px' }}>✓</div>
            <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Password Updated</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              Your password has been reset and all other sessions have been revoked. You may now sign in.
            </p>
            <button type="button" className="go" style={{ width: '100%' }} onClick={() => navigate('/')}>
              {t.signin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h1 style={{ fontSize: '26px', margin: '0 0 4px 0' }}>Reset Password</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 10px 0' }}>
              Choose a secure password of at least 10 characters.
            </p>

            {error && <p role="alert" className="err">{error}</p>}

            <div className="field">
              <label htmlFor="rp-new">{t.newPassword}</label>
              <input id="rp-new" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="rp-conf">{t.confirmPassword}</label>
              <input id="rp-conf" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="go" disabled={loading || !password || !confirmPassword}>
              {loading ? <Spinner /> : 'Update Password'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
