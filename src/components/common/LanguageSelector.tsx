import React from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useApp();

  const options: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'rw', label: 'Ikinyarwanda', short: 'RW' },
    { code: 'fr', label: 'Français', short: 'FR' },
  ];

  return (
    <div className="flex items-center gap-1.5 text-[12px] bg-[var(--surface)] p-1 rounded-full border border-[var(--border)]">
      <Globe className="w-3.5 h-3.5 text-[var(--muted)] ml-1.5 shrink-0" />
      <div className="flex items-center gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
              language === opt.code
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {compact ? opt.short : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
