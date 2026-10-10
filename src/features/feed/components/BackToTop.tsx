import React from 'react';
import { ArrowUp } from 'lucide-react';
import { ScrollDirection } from '../hooks/useScrollDirection';

interface BackToTopProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  direction: ScrollDirection;
  onScrollToTop: () => void;
}

export const BackToTop: React.FC<BackToTopProps> = ({
  containerRef,
  direction,
  onScrollToTop,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const checkScroll = () => {
      let scrollTop = 0;
      let clientHeight = window.innerHeight;

      if (containerRef?.current) {
        scrollTop = containerRef.current.scrollTop;
        clientHeight = containerRef.current.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      }

      // Visible when scrollTop > 1.5 * clientHeight AND direction === 'up'
      const pastThreshold = scrollTop > 1.5 * clientHeight;
      setIsVisible(pastThreshold && direction === 'up');
    };

    const target = containerRef?.current || window;
    target.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    return () => target.removeEventListener('scroll', checkScroll);
  }, [containerRef, direction]);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={onScrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 z-30 w-[38px] h-[38px] rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shadow-md hover:bg-[var(--hover)] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <ArrowUp className="w-4 h-4 stroke-[2]" />
    </button>
  );
};
