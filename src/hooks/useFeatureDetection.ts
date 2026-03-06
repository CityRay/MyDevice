import { useMemo } from 'react';
import type { FeatureItem, FeatureResult, FeatureStatus } from '@/types';

function cssSupports(property: string, value: string = 'initial'): FeatureStatus {
  try {
    return CSS.supports(property, value) ? 'supported' : 'unsupported';
  } catch {
    return 'unknown';
  }
}

function cssSupportsRule(rule: string): FeatureStatus {
  try {
    return CSS.supports(rule) ? 'supported' : 'unsupported';
  } catch {
    return 'unknown';
  }
}

function mediaQuerySupports(query: string): FeatureStatus {
  try {
    if (typeof window.matchMedia !== 'function') return 'unsupported';

    const mql = window.matchMedia(query);
    // Unknown media features are typically serialized as "not all".
    return mql.media === 'not all' ? 'unsupported' : 'supported';
  } catch {
    return 'unknown';
  }
}

function apiExists(...path: string[]): FeatureStatus {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = window;
    for (const key of path) {
      obj = obj[key];
      if (obj === undefined || obj === null) return 'unsupported';
    }
    return 'supported';
  } catch {
    return 'unsupported';
  }
}

/* ─── Feature List ─── */

const featureList: FeatureItem[] = [
  // CSS Layout
  {
    id: 'flexbox',
    name: 'Flexbox',
    category: 'css-layout',
    description: 'CSS Flexible Box Layout',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout',
    detect: () => cssSupports('display', 'flex')
  },
  {
    id: 'grid',
    name: 'CSS Grid',
    category: 'css-layout',
    description: 'CSS Grid Layout',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
    detect: () => cssSupports('display', 'grid')
  },
  {
    id: 'subgrid',
    name: 'Subgrid',
    category: 'css-layout',
    description: 'CSS Grid Subgrid',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid',
    detect: () => cssSupports('grid-template-columns', 'subgrid')
  },
  {
    id: 'container-queries',
    name: 'Container Queries',
    category: 'css-layout',
    description: 'CSS Container Queries (@container)',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries',
    detect: () => cssSupports('container-type', 'inline-size')
  },
  {
    id: 'multi-column',
    name: 'Multi-column',
    category: 'css-layout',
    description: 'CSS Multi-column Layout',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_multicol_layout',
    detect: () => cssSupports('column-count', '2')
  },
  {
    id: 'position-sticky',
    name: 'position: sticky',
    category: 'css-layout',
    description: 'CSS Sticky Positioning',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position',
    detect: () => cssSupports('position', 'sticky')
  },

  // CSS Visual
  {
    id: 'border-radius',
    name: 'Border Radius',
    category: 'css-visual',
    description: 'CSS Border Radius',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius',
    detect: () => cssSupports('border-radius', '10px')
  },
  {
    id: 'box-shadow',
    name: 'Box Shadow',
    category: 'css-visual',
    description: 'CSS Box Shadow',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
    detect: () => cssSupports('box-shadow', '0 0 5px black')
  },
  {
    id: 'gradients',
    name: 'Gradients',
    category: 'css-visual',
    description: 'CSS Linear/Radial Gradients',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient',
    detect: () => cssSupports('background', 'linear-gradient(red, blue)')
  },
  {
    id: 'filters',
    name: 'CSS Filters',
    category: 'css-visual',
    description: 'CSS Filter Effects',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/filter',
    detect: () => cssSupports('filter', 'blur(5px)')
  },
  {
    id: 'backdrop-filter',
    name: 'Backdrop Filter',
    category: 'css-visual',
    description: 'CSS Backdrop Filter',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter',
    detect: () => cssSupports('backdrop-filter', 'blur(10px)')
  },
  {
    id: 'mix-blend-mode',
    name: 'Mix Blend Mode',
    category: 'css-visual',
    description: 'CSS Mix Blend Mode',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode',
    detect: () => cssSupports('mix-blend-mode', 'multiply')
  },
  {
    id: 'object-fit',
    name: 'object-fit',
    category: 'css-visual',
    description: 'CSS Object Fit',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit',
    detect: () => cssSupports('object-fit', 'cover')
  },
  {
    id: 'mask-image',
    name: 'CSS Masks',
    category: 'css-visual',
    description: 'CSS Masking',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image',
    detect: () => cssSupports('mask-image', 'none')
  },
  {
    id: 'color-mix',
    name: 'color-mix()',
    category: 'css-visual',
    description: 'CSS Color Mix Function',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix',
    detect: () => cssSupports('color', 'color-mix(in srgb, red 50%, blue)')
  },
  {
    id: 'accent-color',
    name: 'accent-color',
    category: 'css-visual',
    description: 'CSS Accent Color',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color',
    detect: () => cssSupports('accent-color', 'auto')
  },
  {
    id: 'view-transitions',
    name: 'View Transitions',
    category: 'css-visual',
    description: 'CSS View Transitions API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API',
    detect: () => apiExists('document', 'startViewTransition')
  },
  {
    id: 'cascade-layers',
    name: 'Cascade Layers',
    category: 'css-visual',
    description: 'CSS @layer',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@layer',
    detect: () => cssSupportsRule('@layer test { }')
  },
  {
    id: 'nesting',
    name: 'CSS Nesting',
    category: 'css-visual',
    description: 'Native CSS Nesting',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting',
    detect: () => cssSupportsRule('selector(& div)')
  },

  // CSS Responsive
  {
    id: 'calc',
    name: 'calc()',
    category: 'css-responsive',
    description: 'CSS calc() function',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/calc',
    detect: () => cssSupports('width', 'calc(100% - 20px)')
  },
  {
    id: 'rem',
    name: 'rem units',
    category: 'css-responsive',
    description: 'CSS rem units',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length#rem',
    detect: () => cssSupports('font-size', '1rem')
  },
  {
    id: 'vw-vh',
    name: 'vw/vh units',
    category: 'css-responsive',
    description: 'Viewport units',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths',
    detect: () => cssSupports('width', '1vw')
  },
  {
    id: 'dvh',
    name: 'dvh/svh/lvh',
    category: 'css-responsive',
    description: 'Dynamic viewport units',
    mdnUrl:
      'https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport',
    detect: () => cssSupports('height', '1dvh')
  },
  {
    id: 'clamp',
    name: 'clamp()',
    category: 'css-responsive',
    description: 'CSS clamp() function',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp',
    detect: () => cssSupports('font-size', 'clamp(1rem, 2vw, 3rem)')
  },
  {
    id: 'has-selector',
    name: ':has() selector',
    category: 'css-responsive',
    description: 'CSS :has() relational pseudo-class',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has',
    detect: () => cssSupportsRule('selector(:has(div))')
  },
  {
    id: 'at-supports',
    name: '@supports',
    category: 'css-responsive',
    description: 'CSS Feature Queries',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@supports',
    detect: () =>
      typeof CSS !== 'undefined' && typeof CSS.supports === 'function' ? 'supported' : 'unsupported'
  },
  {
    id: 'aspect-ratio',
    name: 'aspect-ratio',
    category: 'css-responsive',
    description: 'CSS Aspect Ratio',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio',
    detect: () => cssSupports('aspect-ratio', '16 / 9')
  },
  {
    id: 'scroll-snap',
    name: 'Scroll Snap',
    category: 'css-responsive',
    description: 'CSS Scroll Snap',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap',
    detect: () => cssSupports('scroll-snap-type', 'x mandatory')
  },
  {
    id: 'mq-hover',
    name: 'Media Query hover',
    category: 'css-responsive',
    description: 'Media query support for (hover: hover)',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover',
    detect: () => mediaQuerySupports('(hover: hover)')
  },
  {
    id: 'mq-any-hover',
    name: 'Media Query any-hover',
    category: 'css-responsive',
    description: 'Media query support for (any-hover: hover)',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-hover',
    detect: () => mediaQuerySupports('(any-hover: hover)')
  },
  {
    id: 'mq-pointer',
    name: 'Media Query pointer',
    category: 'css-responsive',
    description: 'Media query support for (pointer: fine)',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer',
    detect: () => mediaQuerySupports('(pointer: fine)')
  },
  {
    id: 'mq-any-pointer',
    name: 'Media Query any-pointer',
    category: 'css-responsive',
    description: 'Media query support for (any-pointer: fine)',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-pointer',
    detect: () => mediaQuerySupports('(any-pointer: fine)')
  },

  // JS APIs
  {
    id: 'service-worker',
    name: 'Service Worker',
    category: 'js-api',
    description: 'Service Worker API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
    detect: () => apiExists('navigator', 'serviceWorker')
  },
  {
    id: 'web-workers',
    name: 'Web Workers',
    category: 'js-api',
    description: 'Dedicated Web Workers',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Worker',
    detect: () => apiExists('Worker')
  },
  {
    id: 'websockets',
    name: 'WebSocket',
    category: 'js-api',
    description: 'WebSocket API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket',
    detect: () => apiExists('WebSocket')
  },
  {
    id: 'geolocation',
    name: 'Geolocation',
    category: 'js-api',
    description: 'Geolocation API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API',
    detect: () => apiExists('navigator', 'geolocation')
  },
  {
    id: 'notifications',
    name: 'Notifications',
    category: 'js-api',
    description: 'Web Notifications API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API',
    detect: () => apiExists('Notification')
  },
  {
    id: 'clipboard',
    name: 'Clipboard API',
    category: 'js-api',
    description: 'Async Clipboard API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
    detect: () => apiExists('navigator', 'clipboard')
  },
  {
    id: 'intersection-observer',
    name: 'IntersectionObserver',
    category: 'js-api',
    description: 'Intersection Observer API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
    detect: () => apiExists('IntersectionObserver')
  },
  {
    id: 'resize-observer',
    name: 'ResizeObserver',
    category: 'js-api',
    description: 'Resize Observer API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver',
    detect: () => apiExists('ResizeObserver')
  },
  {
    id: 'mutation-observer',
    name: 'MutationObserver',
    category: 'js-api',
    description: 'Mutation Observer API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver',
    detect: () => apiExists('MutationObserver')
  },
  {
    id: 'indexeddb',
    name: 'IndexedDB',
    category: 'js-api',
    description: 'IndexedDB API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
    detect: () => apiExists('indexedDB')
  },
  {
    id: 'web-animations',
    name: 'Web Animations',
    category: 'js-api',
    description: 'Web Animations API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API',
    detect: () => apiExists('Element', 'prototype', 'animate')
  },
  {
    id: 'web-share',
    name: 'Web Share',
    category: 'js-api',
    description: 'Web Share API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
    detect: () => apiExists('navigator', 'share')
  },
  {
    id: 'web-bluetooth',
    name: 'Web Bluetooth',
    category: 'js-api',
    description: 'Web Bluetooth API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API',
    detect: () => apiExists('navigator', 'bluetooth')
  },
  {
    id: 'web-usb',
    name: 'WebUSB',
    category: 'js-api',
    description: 'WebUSB API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API',
    detect: () => apiExists('navigator', 'usb')
  },
  {
    id: 'webgpu',
    name: 'WebGPU',
    category: 'js-api',
    description: 'WebGPU API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
    detect: () => apiExists('navigator', 'gpu')
  },
  {
    id: 'webgl',
    name: 'WebGL',
    category: 'js-api',
    description: 'WebGL Rendering',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API',
    detect: () => {
      try {
        return document.createElement('canvas').getContext('webgl2') ? 'supported' : 'unsupported';
      } catch {
        return 'unsupported';
      }
    }
  },

  // Media
  {
    id: 'canvas',
    name: 'Canvas',
    category: 'media',
    description: 'HTML5 Canvas 2D',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
    detect: () => {
      try {
        return document.createElement('canvas').getContext('2d') ? 'supported' : 'unsupported';
      } catch {
        return 'unsupported';
      }
    }
  },
  {
    id: 'svg',
    name: 'SVG',
    category: 'media',
    description: 'Inline SVG support',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/SVG',
    detect: () => (typeof SVGElement !== 'undefined' ? 'supported' : 'unsupported')
  },
  {
    id: 'video',
    name: 'Video',
    category: 'media',
    description: 'HTML5 Video',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video',
    detect: () => {
      try {
        return typeof document.createElement('video').canPlayType === 'function'
          ? 'supported'
          : 'unsupported';
      } catch {
        return 'unsupported';
      }
    }
  },
  {
    id: 'audio',
    name: 'Audio',
    category: 'media',
    description: 'HTML5 Audio',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio',
    detect: () => {
      try {
        return typeof document.createElement('audio').canPlayType === 'function'
          ? 'supported'
          : 'unsupported';
      } catch {
        return 'unsupported';
      }
    }
  },
  {
    id: 'webp',
    name: 'WebP',
    category: 'media',
    description: 'WebP image format support',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#webp_image',
    detect: () => {
      const c = document.createElement('canvas');
      return c.toDataURL('image/webp').startsWith('data:image/webp') ? 'supported' : 'unsupported';
    }
  },
  {
    id: 'avif',
    name: 'AVIF',
    category: 'media',
    description: 'AVIF image format support',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#avif_image',
    detect: () => {
      const c = document.createElement('canvas');
      return c.toDataURL('image/avif').startsWith('data:image/avif') ? 'supported' : 'unsupported';
    }
  },
  {
    id: 'picture',
    name: '<picture>',
    category: 'media',
    description: 'HTML picture element',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture',
    detect: () => apiExists('HTMLPictureElement')
  },
  {
    id: 'media-source',
    name: 'Media Source',
    category: 'media',
    description: 'Media Source Extensions',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
    detect: () => apiExists('MediaSource')
  },

  // Performance
  {
    id: 'perf-observer',
    name: 'PerformanceObserver',
    category: 'performance',
    description: 'Performance Observer API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver',
    detect: () => apiExists('PerformanceObserver')
  },
  {
    id: 'navigation-timing',
    name: 'Navigation Timing',
    category: 'performance',
    description: 'Navigation Timing API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming',
    detect: () => apiExists('PerformanceNavigationTiming')
  },
  {
    id: 'request-idle',
    name: 'requestIdleCallback',
    category: 'performance',
    description: 'Request Idle Callback',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback',
    detect: () => apiExists('requestIdleCallback')
  },
  {
    id: 'scheduler',
    name: 'Scheduler API',
    category: 'performance',
    description: 'Prioritized Task Scheduling',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Scheduler',
    detect: () => apiExists('scheduler', 'postTask')
  },
  {
    id: 'offscreen-canvas',
    name: 'OffscreenCanvas',
    category: 'performance',
    description: 'OffscreenCanvas API',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas',
    detect: () => apiExists('OffscreenCanvas')
  },

  // Accessibility
  {
    id: 'prefers-reduced-motion',
    name: 'prefers-reduced-motion',
    category: 'accessibility',
    description: 'User prefers reduced motion',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
    detect: () => (typeof window.matchMedia === 'function' ? 'supported' : 'unsupported')
  },
  {
    id: 'focus-visible',
    name: ':focus-visible',
    category: 'accessibility',
    description: 'CSS :focus-visible pseudo-class',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible',
    detect: () => cssSupportsRule('selector(:focus-visible)')
  },
  {
    id: 'aria',
    name: 'ARIA (role attribute)',
    category: 'accessibility',
    description: 'WAI-ARIA role support',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA',
    detect: () => 'supported'
  },
  {
    id: 'dialog',
    name: '<dialog> element',
    category: 'accessibility',
    description: 'Native HTML dialog element',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog',
    detect: () => apiExists('HTMLDialogElement')
  },
  {
    id: 'inert',
    name: 'inert attribute',
    category: 'accessibility',
    description: 'HTML inert attribute',
    mdnUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert',
    detect: () => ('inert' in HTMLElement.prototype ? 'supported' : 'unsupported')
  }
];

export function useFeatureDetection(): FeatureResult[] {
  return useMemo(() => featureList.map((f) => ({ ...f, status: f.detect() })), []);
}

export const featureCategories: Record<string, string> = {
  'css-layout': 'CSS Layout',
  'css-visual': 'CSS Visual & Effects',
  'css-responsive': 'CSS Responsive',
  'js-api': 'JavaScript APIs',
  media: 'Media & Graphics',
  performance: 'Performance',
  accessibility: 'Accessibility'
};
