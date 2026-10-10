import { COMMON_PASSWORDS } from '../data/commonPasswords';

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  hint?: string;
  ruleKey?: 'length' | 'common' | 'email_match' | 'complexity';
}

export function evaluatePasswordStrength(password: string, email?: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, score: 0, hint: 'At least 10 characters', ruleKey: 'length' };
  }

  // 1. Length rule
  if (password.length < 10) {
    return {
      isValid: false,
      score: 1,
      hint: 'Password must be at least 10 characters long',
      ruleKey: 'length',
    };
  }

  // 2. Common password rule
  const normalized = password.toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) {
    return {
      isValid: false,
      score: 1,
      hint: 'This password is too common and easily guessed',
      ruleKey: 'common',
    };
  }

  // 3. Email local part rule
  if (email) {
    const localPart = email.split('@')[0]?.toLowerCase();
    if (localPart && localPart.length >= 3 && normalized.includes(localPart)) {
      return {
        isValid: false,
        score: 1,
        hint: 'Password must not contain your email username',
        ruleKey: 'email_match',
      };
    }
  }

  // 4. Complexity & entropy score estimation (mimicking zxcvbn score 0-4)
  let complexityPoints = 0;
  if (/[a-z]/.test(password)) complexityPoints++;
  if (/[A-Z]/.test(password)) complexityPoints++;
  if (/\d/.test(password)) complexityPoints++;
  if (/[^a-zA-Z0-9]/.test(password)) complexityPoints++;
  if (password.length >= 14) complexityPoints++;
  if (password.length >= 18) complexityPoints++;

  let score = 2;
  if (complexityPoints >= 4 && password.length >= 12) {
    score = 4;
  } else if (complexityPoints >= 3) {
    score = 3;
  }

  if (score < 3) {
    return {
      isValid: false,
      score,
      hint: 'Include a mix of uppercase letters, numbers, and symbols',
      ruleKey: 'complexity',
    };
  }

  return {
    isValid: true,
    score,
    hint: undefined,
  };
}
