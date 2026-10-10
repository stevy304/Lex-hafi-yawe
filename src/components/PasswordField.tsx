import React, { useState } from 'react';
import { Translations } from '../i18n/strings';

interface PasswordFieldProps {
  t: Translations;
  value: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  t,
  value,
  onChange,
  onKeyDown,
  isInvalid = false,
  disabled = false,
  inputRef,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`field ${isInvalid ? 'invalid' : ''}`}>
      <label htmlFor="auth-password">{t.password}</label>
      <input
        ref={inputRef}
        id="auth-password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ paddingRight: '48px' }}
      />
      <button
        type="button"
        className="eye"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? t.hidePw : t.showPw}
        aria-pressed={showPassword}
        tabIndex={0}
      >
        {showPassword ? (
          // Eye off icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          // Eye icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
};
