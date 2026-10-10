import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'top' | 'up' | 'down';

export interface UseScrollDirectionOptions {
  threshold?: number;
}

export function computeScrollDirection(
  currentScrollTop: number,
  lastScrollTop: number,
  lastDirection: ScrollDirection,
  cumulativeDelta: number,
  threshold: number
): { direction: ScrollDirection; cumulativeDelta: number } {
  if (currentScrollTop < 8) {
    return { direction: 'top', cumulativeDelta: 0 };
  }

  const delta = currentScrollTop - lastScrollTop;
  let newCumulative = cumulativeDelta;

  if (delta > 0) {
    // Scrolling downward
    newCumulative = newCumulative > 0 ? newCumulative + delta : delta;
    if (newCumulative >= threshold) {
      return { direction: 'down', cumulativeDelta: 0 };
    }
  } else if (delta < 0) {
    // Scrolling upward
    newCumulative = newCumulative < 0 ? newCumulative + delta : delta;
    if (Math.abs(newCumulative) >= threshold) {
      return { direction: 'up', cumulativeDelta: 0 };
    }
  }

  return { direction: lastDirection, cumulativeDelta: newCumulative };
}

export function useScrollDirection(
  containerRef?: React.RefObject<HTMLElement | null>,
  options: UseScrollDirectionOptions = {}
): ScrollDirection {
  const { threshold = 12 } = options;
  const [direction, setDirection] = useState<ScrollDirection>('top');

  const lastScrollTopRef = useRef<number>(0);
  const cumulativeDeltaRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const getScrollTop = (): number => {
      if (containerRef && containerRef.current) {
        return containerRef.current.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const target: EventTarget = containerRef?.current || window;

    const handleScroll = () => {
      if (rafIdRef.current !== null) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const currentY = getScrollTop();

        setDirection((prevDirection) => {
          const res = computeScrollDirection(
            currentY,
            lastScrollTopRef.current,
            prevDirection,
            cumulativeDeltaRef.current,
            threshold
          );
          cumulativeDeltaRef.current = res.cumulativeDelta;
          lastScrollTopRef.current = currentY;
          return res.direction;
        });
      });
    };

    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [containerRef, threshold]);

  return direction;
}
