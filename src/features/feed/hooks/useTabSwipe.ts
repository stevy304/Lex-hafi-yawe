import { useEffect, useRef } from 'react';

interface UseTabSwipeOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useTabSwipe({
  containerRef,
  onSwipeLeft,
  onSwipeRight,
}: UseTabSwipeOptions) {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const trackingRef = useRef(false);

  useEffect(() => {
    const el = containerRef?.current || window;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      trackingRef.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!trackingRef.current) return;
      trackingRef.current = false;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Horizontal movement > 60px and > 1.5x vertical movement switches tab
      if (absX > 60 && absX > 1.5 * absY) {
        if (deltaX < 0) {
          // Swipe left -> next tab
          onSwipeLeft?.();
        } else {
          // Swipe right -> prev tab
          onSwipeRight?.();
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart as any, { passive: true });
    el.addEventListener('touchend', handleTouchEnd as any, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart as any);
      el.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [containerRef, onSwipeLeft, onSwipeRight]);
}
