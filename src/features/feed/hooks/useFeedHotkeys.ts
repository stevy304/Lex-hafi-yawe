import { useEffect } from 'react';

interface UseFeedHotkeysOptions {
  onNextPost?: () => void;
  onPrevPost?: () => void;
  onLikeCurrent?: () => void;
  onBookmarkCurrent?: () => void;
  onCommentCurrent?: () => void;
  onOpenComposer?: () => void;
  onFocusSearch?: () => void;
  onJumpToNewPosts?: () => void;
  onOpenShortcutsDialog?: () => void;
}

export function useFeedHotkeys({
  onNextPost,
  onPrevPost,
  onLikeCurrent,
  onBookmarkCurrent,
  onCommentCurrent,
  onOpenComposer,
  onFocusSearch,
  onJumpToNewPosts,
  onOpenShortcutsDialog,
}: UseFeedHotkeysOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignored with modifier keys (except Shift+? which is naturally just key === '?')
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox'
        ) {
          return;
        }
      }

      switch (e.key) {
        case 'j':
        case 'J':
          e.preventDefault();
          onNextPost?.();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          onPrevPost?.();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          onLikeCurrent?.();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          onBookmarkCurrent?.();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          onCommentCurrent?.();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          onOpenComposer?.();
          break;
        case '/':
          e.preventDefault();
          onFocusSearch?.();
          break;
        case '.':
          e.preventDefault();
          onJumpToNewPosts?.();
          break;
        case '?':
          e.preventDefault();
          onOpenShortcutsDialog?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNextPost,
    onPrevPost,
    onLikeCurrent,
    onBookmarkCurrent,
    onCommentCurrent,
    onOpenComposer,
    onFocusSearch,
    onJumpToNewPosts,
    onOpenShortcutsDialog,
  ]);
}
