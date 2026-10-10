import { useState, useEffect, useRef } from 'react';

export interface DraftState {
  content: string;
  visibility: 'public' | 'followers';
  topic: string;
}

const DRAFT_STORAGE_KEY = 'lex_feed_composer_draft';

export function getSavedDraft(): DraftState | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function saveDraftToStorage(draft: DraftState) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  } catch {}
}

export function clearDraftFromStorage() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {}
}

export function useDraft(initialDraft?: Partial<DraftState>) {
  const [draft, setDraft] = useState<DraftState>(() => {
    const saved = getSavedDraft();
    return {
      content: initialDraft?.content ?? saved?.content ?? '',
      visibility: initialDraft?.visibility ?? saved?.visibility ?? 'public',
      topic: initialDraft?.topic ?? saved?.topic ?? 'General legal',
    };
  });

  const timerRef = useRef<number | null>(null);

  // Debounced 500ms auto-save
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      if (draft.content.trim()) {
        saveDraftToStorage(draft);
      } else {
        clearDraftFromStorage();
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft]);

  // Leaving route confirm prompt if more than 20 characters
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draft.content.trim().length > 20) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draft.content]);

  const updateContent = (content: string) => {
    setDraft((prev) => ({ ...prev, content }));
  };

  const updateVisibility = (visibility: 'public' | 'followers') => {
    setDraft((prev) => ({ ...prev, visibility }));
  };

  const updateTopic = (topic: string) => {
    setDraft((prev) => ({ ...prev, topic }));
  };

  const clearDraft = () => {
    setDraft({
      content: '',
      visibility: 'public',
      topic: 'General legal',
    });
    clearDraftFromStorage();
  };

  return {
    draft,
    updateContent,
    updateVisibility,
    updateTopic,
    clearDraft,
  };
}
