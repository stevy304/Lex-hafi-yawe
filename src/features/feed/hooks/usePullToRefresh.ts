import { useState, useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  containerRef,
  onRefresh,
  threshold = 70,
  resistance = 0.5,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalRef = useRef(false);

  useEffect(() => {
    const el = containerRef?.current || window;

    const getScrollTop = () => {
      if (containerRef?.current) return containerRef.current.scrollTop;
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (getScrollTop() > 0 || isRefreshing) return;
      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      isDraggingRef.current = true;
      isHorizontalRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || isRefreshing) return;
      const touch = e.touches[0];
      const deltaY = touch.clientY - startYRef.current;
      const deltaX = touch.clientX - startXRef.current;

      // Ignore when gesture is mostly horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isHorizontalRef.current = true;
        setPullDistance(0);
        return;
      }

      if (isHorizontalRef.current || deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      const distance = deltaY * resistance;
      setPullDistance(distance);
    };

    const handleTouchEnd = async () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    el.addEventListener('touchstart', handleTouchStart as any, { passive: true });
    el.addEventListener('touchmove', handleTouchMove as any, { passive: true });
    el.addEventListener('touchend', handleTouchEnd as any);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart as any);
      el.removeEventListener('touchmove', handleTouchMove as any);
      el.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [containerRef, onRefresh, threshold, resistance, pullDistance, isRefreshing]);

  return {
    pullDistance,
    isRefreshing,
  };
}
