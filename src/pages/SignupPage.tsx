import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import { useTheme } from '../hooks/useTheme';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

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

          <h1 style={{ fontSize: '32px', margin: '8px 0' }}>{t.create}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {lang === 'rw'
              ? 'Kwiyandikisha ku rubuga rwa Lex Hafi Yawe gufasha abaturage kugera ku butabera bwa digitale.'
              : lang === 'fr'
              ? 'Création de compte Lex Hafi Yawe pour accéder à la justice numérique au Rwanda.'
              : 'Create an account to access verified advocates, legal aid, and official updates in Rwanda.'}
          </p>

          <div className="auth" style={{ marginTop: '12px' }}>
            <div className="field">
              <label htmlFor="reg-name">Full name</label>
              <input id="reg-name" type="text" placeholder="" />
            </div>

            <div className="field">
              <label htmlFor="reg-email">{t.label}</label>
              <input id="reg-email" type="email" placeholder="" />
            </div>

            <button type="button" className="go" onClick={() => navigate('/')}>
              {t.cont}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
