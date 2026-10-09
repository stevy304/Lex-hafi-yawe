import React from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useApp();

  const options: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'rw', label: 'Ikinyarwanda', short: 'RW' },
    { code: 'fr', label: 'Français', short: 'FR' }
  ];

  return (
    <div className="flex items-center gap-1.5 text-xs bg-slate-100/90 hover:bg-slate-200/80 transition p-1 rounded-lg border border-slate-200">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
      <div className="flex items-center gap-0.5">
        {options.map(opt => (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className={`px-2 py-0.5 rounded font-medium transition ${
              language === opt.code
                ? 'bg-white text-blue-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {compact ? opt.short : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
