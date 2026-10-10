export interface ScrollRestorationEntry {
  scrollTop: number;
  firstVisibleId?: string;
  loadedPostIds: string[];
  timestamp: number;
}

const memoryStore = new Map<string, ScrollRestorationEntry>();
const SESSION_PREFIX = 'lex_feed_restore_';

export function makeKey(tab: string, topic?: string, verified = false, media = false): string {
  return `${tab}|${topic || 'all'}|${verified ? '1' : '0'}|${media ? '1' : '0'}`;
}

export function saveScrollState(
  key: string,
  state: { scrollTop: number; firstVisibleId?: string; loadedPostIds: string[] }
): void {
  const entry: ScrollRestorationEntry = {
    ...state,
    timestamp: Date.now(),
  };
  memoryStore.set(key, entry);

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`${SESSION_PREFIX}${key}`, JSON.stringify(entry));
    }
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function getScrollState(key: string): ScrollRestorationEntry | null {
  if (memoryStore.has(key)) {
    return memoryStore.get(key)!;
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(`${SESSION_PREFIX}${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as ScrollRestorationEntry;
        memoryStore.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export function clearScrollState(key?: string): void {
  if (key) {
    memoryStore.delete(key);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(`${SESSION_PREFIX}${key}`);
      }
    } catch {}
  } else {
    memoryStore.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(SESSION_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      }
    } catch {}
  }
}
