import { useState, useEffect } from 'react';
import { BREAKPOINTS, BreakpointName, getBreakpointName, isLandscapePhoneDimensions } from '../utils/breakpoints';

export interface BreakpointState {
  breakpoint: BreakpointName;
  isMobile: boolean;       // < 960px (phone or tablet portrait)
  isPhone: boolean;        // < 600px
  isTablet: boolean;       // 600 - 959px
  isCompact: boolean;      // 960 - 1199px (72px icon rail)
  isDesktop: boolean;      // >= 1200px
  isLandscapePhone: boolean; // height < 500px on small screens
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'desktop',
        isMobile: false,
        isPhone: false,
        isTablet: false,
        isCompact: false,
        isDesktop: true,
        isLandscapePhone: false,
      };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    const bp = getBreakpointName(width);
    return {
      breakpoint: bp,
      isMobile: width < BREAKPOINTS.compactMin,
      isPhone: bp === 'phone',
      isTablet: bp === 'tablet',
      isCompact: bp === 'compact',
      isDesktop: bp === 'desktop',
      isLandscapePhone: isLandscapePhoneDimensions(width, height),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const phoneQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.phoneMax}px)`);
    const tabletQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.tabletMin}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`);
    const compactQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.compactMin}px) and (max-width: ${BREAKPOINTS.compactMax}px)`);
    const desktopQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.desktopMin}px)`);
    const landscapeQuery = window.matchMedia(`(max-height: ${BREAKPOINTS.landscapeHeightMax}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`);

    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const bp = getBreakpointName(width);
      setState({
        breakpoint: bp,
        isMobile: width < BREAKPOINTS.compactMin,
        isPhone: bp === 'phone',
        isTablet: bp === 'tablet',
        isCompact: bp === 'compact',
        isDesktop: bp === 'desktop',
        isLandscapePhone: isLandscapePhoneDimensions(width, height),
      });
    };

    phoneQuery.addEventListener?.('change', update);
    tabletQuery.addEventListener?.('change', update);
    compactQuery.addEventListener?.('change', update);
    desktopQuery.addEventListener?.('change', update);
    landscapeQuery.addEventListener?.('change', update);
    window.addEventListener('resize', update);

    return () => {
      phoneQuery.removeEventListener?.('change', update);
      tabletQuery.removeEventListener?.('change', update);
      compactQuery.removeEventListener?.('change', update);
      desktopQuery.removeEventListener?.('change', update);
      landscapeQuery.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return state;
}
