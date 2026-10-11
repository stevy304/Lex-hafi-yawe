import { useState, useEffect, useCallback } from 'react';

export interface VisualViewportState {
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  scrollInputIntoView: (target?: HTMLElement | null) => void;
}

export function useVisualViewport(): VisualViewportState {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    if (!vv) {
      document.documentElement.style.setProperty('--kb-h', '0px');
      setKeyboardHeight(0);
      return;
    }

    // Keyboard height estimate = window.innerHeight - (vv.height + vv.offsetTop)
    const kbH = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    document.documentElement.style.setProperty('--kb-h', `${kbH}px`);
    setKeyboardHeight(kbH);
  }, []);

  const scrollInputIntoView = useCallback((target?: HTMLElement | null) => {
    const el = target || (document.activeElement as HTMLElement);
    if (el && typeof el.scrollIntoView === 'function') {
      setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 150);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);

    // Initial update
    updateViewport();

    // Listen for focus on inputs to trigger scrollIntoView when keyboard opens
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true')
      ) {
        scrollInputIntoView(target);
      }
    };
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [updateViewport, scrollInputIntoView]);

  return {
    keyboardHeight,
    isKeyboardOpen: keyboardHeight > 60,
    scrollInputIntoView,
  };
}
