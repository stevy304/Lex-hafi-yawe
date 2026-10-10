export interface ConfidentialMatch {
  type: 'citizen_id' | 'phone' | 'email';
  start: number;
  end: number;
  text: string;
}

const CITIZEN_ID_REGEX = /\b\d{16}\b/g;
const PHONE_REGEX = /(\+?250\s?7[2389]\d{7}|07[2389]\d{7}|\b\+?[1-9]\d{8,14}\b)/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

export function findConfidentialMatches(input: string): ConfidentialMatch[] {
  if (!input) return [];
  const matches: ConfidentialMatch[] = [];

  // 1. Citizen IDs (16 digits)
  let m: RegExpExecArray | null;
  while ((m = CITIZEN_ID_REGEX.exec(input)) !== null) {
    matches.push({
      type: 'citizen_id',
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  // 2. Emails
  while ((m = EMAIL_REGEX.exec(input)) !== null) {
    // Avoid double matching inside already found ranges
    const start = m.index;
    const end = m.index + m[0].length;
    if (!matches.some((existing) => start < existing.end && end > existing.start)) {
      matches.push({
        type: 'email',
        start,
        end,
        text: m[0],
      });
    }
  }

  // 3. Phones (only if not overlapping 16-digit ID)
  while ((m = PHONE_REGEX.exec(input)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    if (!matches.some((existing) => start < existing.end && end > existing.start)) {
      matches.push({
        type: 'phone',
        start,
        end,
        text: m[0],
      });
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

export function evaluateConfidentialRisk(matches: ConfidentialMatch[]): {
  hasRisk: boolean;
  blocksPost: boolean;
  primaryType: 'citizen_id' | 'phone' | 'email' | null;
  messageKey: string;
} {
  if (matches.length === 0) {
    return { hasRisk: false, blocksPost: false, primaryType: null, messageKey: '' };
  }

  const hasCitizenId = matches.some((m) => m.type === 'citizen_id');
  if (hasCitizenId) {
    return {
      hasRisk: true,
      blocksPost: true,
      primaryType: 'citizen_id',
      messageKey: 'id_warning',
    };
  }

  const hasPhone = matches.some((m) => m.type === 'phone');
  if (hasPhone) {
    return {
      hasRisk: true,
      blocksPost: false,
      primaryType: 'phone',
      messageKey: 'phone_warning',
    };
  }

  return {
    hasRisk: true,
    blocksPost: false,
    primaryType: 'email',
    messageKey: 'email_warning',
  };
}
