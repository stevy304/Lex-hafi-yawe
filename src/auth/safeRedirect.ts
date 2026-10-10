export function sanitizeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (trimmed.length === 0 || trimmed.length >= 200) return null;
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://') || trimmed.includes('\\')) return null;
  return trimmed;
}
