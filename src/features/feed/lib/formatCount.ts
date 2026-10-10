export function formatCount(count: number, locale = 'en'): string {
  if (count < 0) return '0';
  if (count < 1000) return count.toString();
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(count);
  } catch {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return count.toString();
  }
}
