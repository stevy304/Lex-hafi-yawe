import { useState, useEffect, useCallback } from 'react';
import { Lang, STRINGS, Translations } from './strings';

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('lex-lang');
      if (saved === 'en' || saved === 'rw' || saved === 'fr') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'en';
  });

  const setLang = useCallback((nextLang: Lang) => {
    setLangState(nextLang);
    try {
      localStorage.setItem('lex-lang', nextLang);
    } catch {
      // Ignore
    }
    document.documentElement.lang = nextLang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t: Translations = STRINGS[lang];

  return { lang, setLang, t };
}
