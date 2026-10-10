import React, { useState } from 'react';
import { Translations } from '../i18n/strings';

interface EmailFieldProps {
  t: Translations;
  onContinue?: (value: string) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({ t, onContinue }) => {
  const [value, setValue] = useState('');

  const isEnabled = value.trim().length > 0;

  const handleContinue = () => {
    if (!isEnabled) return;
    // TODO: connect auth
    if (onContinue) {
      onContinue(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isEnabled) {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <>
      <div className="field">
        <label htmlFor="id">{t.label}</label>
        <input
          id="id"
          type="text"
          autoComplete="username"
          inputMode="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        type="button"
        className="go"
        id="go"
        disabled={!isEnabled}
        onClick={handleContinue}
      >
        {t.cont}
      </button>

      <p className="legal">
        <span>{t.l1}</span>{' '}
        <a href="#terms">{t.terms}</a>{' '}
        <span>{t.l2}</span>{' '}
        <a href="#privacy">{t.privacy}</a>.
      </p>
    </>
  );
};
