import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import { useTheme } from '../hooks/useTheme';
import { LogoIcon } from '../components/LogoIcon';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';

export const ApplyAdvocatePage: React.FC = () => {
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

          <h1 style={{ fontSize: '32px', margin: '8px 0' }}>{t.adv}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {lang === 'rw'
              ? 'Saba kwemezwa nk\'umuvoka w\'umwuga mu Rwanda kugira ngo utange ubufasha mu by\'amategeko.'
              : lang === 'fr'
              ? 'Postulez en tant qu\'avocat inscrit au barreau du Rwanda pour offrir des conseils et de l\'aide juridique.'
              : 'Apply for official advocate verification with your Rwanda Bar Association credentials.'}
          </p>

          <div className="auth" style={{ marginTop: '12px' }}>
            <div className="field">
              <label htmlFor="adv-roll">Bar Roll Number (e.g. RBA/2026/012)</label>
              <input id="adv-roll" type="text" />
            </div>

            <div className="field">
              <label htmlFor="adv-firm">Law Firm / Chamber</label>
              <input id="adv-firm" type="text" />
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
