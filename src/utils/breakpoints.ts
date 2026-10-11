import { BP } from '../app/breakpoints';

export const BREAKPOINTS = {
  phoneMax: BP.tablet - 1, // 599
  tabletMin: BP.tablet,    // 600
  tabletMax: BP.rail - 1,  // 959
  compactMin: BP.rail,     // 960
  compactMax: BP.full - 1, // 1199
  desktopMin: BP.full,     // 1200
  landscapeHeightMax: 499,
} as const;

export type BreakpointName = 'phone' | 'tablet' | 'compact' | 'desktop';

export function getBreakpointName(width: number): BreakpointName {
  if (width < BREAKPOINTS.tabletMin) return 'phone';
  if (width <= BREAKPOINTS.tabletMax) return 'tablet';
  if (width <= BREAKPOINTS.compactMax) return 'compact';
  return 'desktop';
}

export function isLandscapePhoneDimensions(width: number, height: number): boolean {
  return height <= BREAKPOINTS.landscapeHeightMax && width < BREAKPOINTS.compactMin;
}
