import React from 'react';
import { Lang } from '../i18n/strings';

interface LanguageSwitcherProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onSelectLang,
}) => {
  return (
    <div className="seg" role="group" aria-label="Language">
      <button
        type="button"
        data-lang="en"
        aria-pressed={currentLang === 'en'}
        onClick={() => onSelectLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        data-lang="rw"
        aria-pressed={currentLang === 'rw'}
        onClick={() => onSelectLang('rw')}
      >
        RW
      </button>
      <button
        type="button"
        data-lang="fr"
        aria-pressed={currentLang === 'fr'}
        onClick={() => onSelectLang('fr')}
      >
        FR
      </button>
    </div>
  );
};
