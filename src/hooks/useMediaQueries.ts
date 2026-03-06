import { useEffect, useState, useMemo } from 'react';
import type { MediaQueryItem, MediaQueryResult } from '@/types';

const mediaQueryList: MediaQueryItem[] = [
  // Preferences
  {
    id: 'dark-mode',
    label: 'Dark mode',
    query: '(prefers-color-scheme: dark)',
    category: 'preference'
  },
  {
    id: 'light-mode',
    label: 'Light mode',
    query: '(prefers-color-scheme: light)',
    category: 'preference'
  },
  {
    id: 'reduced-motion',
    label: 'Reduced motion',
    query: '(prefers-reduced-motion: reduce)',
    category: 'preference'
  },
  {
    id: 'reduced-transparency',
    label: 'Reduced transparency',
    query: '(prefers-reduced-transparency: reduce)',
    category: 'preference'
  },
  {
    id: 'high-contrast',
    label: 'More contrast',
    query: '(prefers-contrast: more)',
    category: 'preference'
  },
  {
    id: 'forced-colors',
    label: 'Forced colors',
    query: '(forced-colors: active)',
    category: 'preference'
  },
  {
    id: 'inverted-colors',
    label: 'Inverted colors',
    query: '(inverted-colors: inverted)',
    category: 'preference'
  },

  // Display
  { id: 'portrait', label: 'Portrait', query: '(orientation: portrait)', category: 'display' },
  { id: 'landscape', label: 'Landscape', query: '(orientation: landscape)', category: 'display' },
  { id: 'retina-2x', label: 'Retina 2x', query: '(min-resolution: 2dppx)', category: 'display' },
  { id: 'retina-3x', label: 'Retina 3x', query: '(min-resolution: 3dppx)', category: 'display' },
  { id: 'hdr', label: 'HDR display', query: '(dynamic-range: high)', category: 'display' },
  { id: 'p3-gamut', label: 'P3 color gamut', query: '(color-gamut: p3)', category: 'display' },
  {
    id: 'srgb-gamut',
    label: 'sRGB color gamut',
    query: '(color-gamut: srgb)',
    category: 'display'
  },
  {
    id: 'rec2020-gamut',
    label: 'Rec. 2020 gamut',
    query: '(color-gamut: rec2020)',
    category: 'display'
  },

  // Interaction
  {
    id: 'fine-pointer',
    label: 'Fine pointer (mouse)',
    query: '(pointer: fine)',
    category: 'interaction'
  },
  {
    id: 'coarse-pointer',
    label: 'Coarse pointer (touch)',
    query: '(pointer: coarse)',
    category: 'interaction'
  },
  { id: 'no-pointer', label: 'No pointer', query: '(pointer: none)', category: 'interaction' },
  { id: 'hover', label: 'Hover capable', query: '(hover: hover)', category: 'interaction' },
  { id: 'no-hover', label: 'No hover', query: '(hover: none)', category: 'interaction' },
  {
    id: 'any-fine',
    label: 'Any fine pointer',
    query: '(any-pointer: fine)',
    category: 'interaction'
  },
  {
    id: 'any-coarse',
    label: 'Any coarse pointer',
    query: '(any-pointer: coarse)',
    category: 'interaction'
  },

  // Color
  { id: 'color', label: 'Color display', query: '(color)', category: 'color' },
  { id: 'monochrome', label: 'Monochrome', query: '(monochrome)', category: 'color' },
  { id: 'color-8bit', label: '8-bit color', query: '(min-color: 8)', category: 'color' }
];

function evaluateQueries(): MediaQueryResult[] {
  if (typeof window.matchMedia !== 'function') {
    return mediaQueryList.map((item) => ({ ...item, supported: 'unsupported', matches: false }));
  }

  return mediaQueryList.map((item) => {
    const mql = window.matchMedia(item.query);
    return {
      ...item,
      supported: mql.media === 'not all' ? 'unsupported' : 'supported',
      matches: mql.matches
    };
  });
}

export function useMediaQueries(): MediaQueryResult[] {
  const [results, setResults] = useState<MediaQueryResult[]>(evaluateQueries);

  const queries = useMemo(() => mediaQueryList.map((q) => q.query), []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mqls = queries.map((q) => window.matchMedia(q));
    const handler = () => setResults(evaluateQueries());

    mqls.forEach((mql) => {
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handler);
      } else {
        mql.addListener(handler);
      }
    });

    return () => {
      mqls.forEach((mql) => {
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', handler);
        } else {
          mql.removeListener(handler);
        }
      });
    };
  }, [queries]);

  return results;
}

export const mediaQueryCategories: Record<string, string> = {
  preference: 'User Preferences',
  display: 'Display',
  interaction: 'Interaction',
  color: 'Color'
};
