const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatRelativeTime(
  dateInput: string | Date | number,
  nowInput: Date | number = Date.now()
): { relative: string; fullKigali: string; iso: string } {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const now = typeof nowInput === 'number' ? new Date(nowInput) : nowInput;

  const iso = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();

  let fullKigali = '';
  try {
    fullKigali = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Kigali',
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(date);
  } catch {
    fullKigali = date.toUTCString();
  }

  if (isNaN(date.getTime())) {
    return { relative: 'now', fullKigali, iso };
  }

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return { relative: 'now', fullKigali, iso };
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return { relative: `${diffMin}m`, fullKigali, iso };
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return { relative: `${diffHours}h`, fullKigali, iso };
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return { relative: `${diffDays}d`, fullKigali, iso };
  }

  // Same year vs previous year
  const isSameYear = date.getFullYear() === now.getFullYear();
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];

  if (isSameYear) {
    return { relative: `${day} ${month}`, fullKigali, iso };
  }

  return { relative: `${day} ${month} ${date.getFullYear()}`, fullKigali, iso };
}
