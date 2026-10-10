import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import { useTheme } from '../hooks/useTheme';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();
  const [ident, setIdent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main className="left" style={{ margin: '0 auto', maxWidth: '600px', width: '100%', flex: 1, justifyContent: 'center' }}>
        <div className="top" style={{ marginBottom: '24px' }}>
          <div className="brand">
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button type="button" className="back" onClick={() => navigate('/')}>
            ← {t.back}
          </button>

          <h1 style={{ fontSize: '32px', margin: '8px 0' }}>{t.forgot}</h1>

          {submitted ? (
            <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text)' }}>
                {lang === 'rw'
                  ? 'Icyifuzo cyo gusubiramo ijambobanga cyoherejwe. Reba imeyili yawe.'
                  : lang === 'fr'
                  ? 'Si un compte existe, les instructions de réinitialisation ont été envoyées.'
                  : 'If an account exists with this identifier, password reset instructions have been sent.'}
              </p>
              <button
                type="button"
                className="go"
                style={{ marginTop: '16px', width: '100%' }}
                onClick={() => navigate('/')}
              >
                {t.signin}
              </button>
            </div>
          ) : (
            <>
              <p className="sub" style={{ margin: 0 }}>
                {lang === 'rw'
                  ? 'Injiza imeyili cyangwa izina ukoresha kugira ngo usubiremo ijambobanga.'
                  : lang === 'fr'
                  ? 'Entrez votre adresse e-mail ou votre nom d\'utilisateur pour réinitialiser votre mot de passe.'
                  : 'Enter your email or username to reset your password.'}
              </p>

              <div className="auth" style={{ marginTop: '12px' }}>
                <div className="field">
                  <label htmlFor="reset-id">{t.label}</label>
                  <input
                    id="reset-id"
                    type="text"
                    value={ident}
                    onChange={(e) => setIdent(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="go"
                  disabled={ident.trim().length === 0}
                  onClick={() => setSubmitted(true)}
                >
                  {t.cont}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
