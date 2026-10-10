import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import { useTheme } from '../hooks/useTheme';
import { LogoIcon } from './LogoIcon';
import { LogoHeroOutline } from './LogoHeroOutline';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { AuthFlow } from './AuthFlow';
import { NewAccountRow } from './NewAccountRow';
import { FeatureChips } from './FeatureChips';
import { QrCard } from './QrCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  return (
    <div className="page">
      <main className="left">
        <div className="top">
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

        <div className="mid">
          <h1>
            <span>{t.h1a}</span>
            <br />
            <em>{t.h1b}</em>
          </h1>
          <p className="sub">{t.sub}</p>

          <AuthFlow t={t} />

          <NewAccountRow
            t={t}
            onCreateAccount={() => navigate('/signup')}
            onApplyAdvocate={() => navigate('/signup?intent=advocate')}
          />
        </div>

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
