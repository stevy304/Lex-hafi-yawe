import { useState, useEffect } from 'react';

export const BP = { tablet: 600, rail: 960, full: 1200 } as const;
export type ShellMode = 'mobile' | 'rail' | 'full';

export function shellModeForWidth(w: number): ShellMode {
  return w < BP.rail ? 'mobile' : w < BP.full ? 'rail' : 'full';
}

export function useShellMode(): ShellMode {
  const getMode = (): ShellMode => {
    if (typeof window === 'undefined') return 'full';
    if (window.matchMedia(`(min-width: ${BP.full}px)`).matches) return 'full';
    if (window.matchMedia(`(min-width: ${BP.rail}px)`).matches) return 'rail';
    return 'mobile';
  };

  const [mode, setMode] = useState<ShellMode>(getMode);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queryRail = window.matchMedia(`(min-width: ${BP.rail}px)`);
    const queryFull = window.matchMedia(`(min-width: ${BP.full}px)`);

    const update = () => {
      setMode(getMode());
    };

    update();

    if (queryRail.addEventListener) {
      queryRail.addEventListener('change', update);
      queryFull.addEventListener('change', update);
    } else {
      queryRail.addListener(update);
      queryFull.addListener(update);
    }

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      if (queryRail.removeEventListener) {
        queryRail.removeEventListener('change', update);
        queryFull.removeEventListener('change', update);
      } else {
        queryRail.removeListener(update);
        queryFull.removeListener(update);
      }
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return mode;
}
