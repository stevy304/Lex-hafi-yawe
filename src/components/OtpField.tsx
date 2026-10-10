import React from 'react';
import { Translations } from '../i18n/strings';

interface OtpFieldProps {
  t: Translations;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (code: string) => void;
  isInvalid?: boolean;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const OtpField: React.FC<OtpFieldProps> = ({
  t,
  value,
  onChange,
  onSubmit,
  isInvalid = false,
  disabled = false,
  inputRef,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    if (digits.length === 6) {
      onSubmit(digits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    if (digits.length === 6) {
      onSubmit(digits);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.length === 6) {
        onSubmit(value);
      }
    }
  };

  return (
    <div className={`field ${isInvalid ? 'invalid' : ''}`}>
      <label htmlFor="auth-otp">{t.codeLabel}</label>
      <input
        ref={inputRef}
        id="auth-otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        disabled={disabled}
        className="otp-input"
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
