import React from 'react';
import { Lang } from '../i18n/strings';
import { useLang } from '../i18n/useLang';

interface LanguageSwitcherProps {
  currentLang?: Lang;
  onSelectLang?: (lang: Lang) => void;
  fullWidth?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang: propCurrentLang,
  onSelectLang: propOnSelectLang,
  fullWidth = false,
  className = '',
}) => {
  const { lang, setLang } = useLang();
  const currentLang = propCurrentLang ?? lang;
  const onSelectLang = propOnSelectLang ?? setLang;
  return (
    <div
      data-testid="lang-switcher"
      className={`seg ${fullWidth ? 'w-full flex !p-0.5 h-8' : ''} ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        data-lang="en"
        aria-pressed={currentLang === 'en'}
        onClick={() => onSelectLang('en')}
        className={fullWidth ? 'flex-1 text-center py-1' : ''}
      >
        EN
      </button>
      <button
        type="button"
        data-lang="rw"
        aria-pressed={currentLang === 'rw'}
        onClick={() => onSelectLang('rw')}
        className={fullWidth ? 'flex-1 text-center py-1' : ''}
      >
        RW
      </button>
      <button
        type="button"
        data-lang="fr"
        aria-pressed={currentLang === 'fr'}
        onClick={() => onSelectLang('fr')}
        className={fullWidth ? 'flex-1 text-center py-1' : ''}
      >
        FR
      </button>
    </div>
  );
};
