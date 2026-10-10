export function normalizePhone(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('250')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+250' + cleaned.slice(1);
  }
  if (/^7\d{8}$/.test(cleaned)) {
    return '+250' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

export function isValidPhone(phone: string): boolean {
  if (/^\+2507[2389]\d{7}$/.test(phone)) {
    return true;
  }
  if (/^\+[1-9]\d{7,14}$/.test(phone)) {
    return true;
  }
  return false;
}

export function maskPhone(phone: string): string {
  if (phone.startsWith('+250') && phone.length === 13) {
    const prefix = phone.slice(0, 4); // +250
    const d12 = phone.slice(4, 6); // 78
    const last2 = phone.slice(-2); // 12
    return `${prefix} ${d12}• ••• •${last2}`;
  }
  if (phone.length > 6) {
    const start = phone.slice(0, 4);
    const end = phone.slice(-2);
    return `${start} ••• •${end}`;
  }
  return phone;
}
