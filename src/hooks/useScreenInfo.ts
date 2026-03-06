import { useEffect, useState, useCallback, useRef } from 'react';
import type { ScreenInfo } from '@/types';

function getScreenInfo(): ScreenInfo {
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  const orientationType =
    screen.orientation?.type ?? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');

  return {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    viewportWidthEm: parseFloat((window.innerWidth / rootFontSize).toFixed(2)),
    viewportHeightEm: parseFloat((window.innerHeight / rootFontSize).toFixed(2)),
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    devicePixelRatio: parseFloat(window.devicePixelRatio.toFixed(2)),
    orientation: orientationType,
    rootFontSize,
    userAgent: navigator.userAgent
  };
}

function throttle<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
  return throttled as T;
}

export function useScreenInfo() {
  const [info, setInfo] = useState<ScreenInfo>(getScreenInfo);
  const cleanupDprRef = useRef<(() => void) | null>(null);

  const update = useCallback(() => {
    setInfo(getScreenInfo());
  }, []);

  useEffect(() => {
    const throttledUpdate = throttle(update, 150);

    window.addEventListener('resize', throttledUpdate);
    screen.orientation?.addEventListener('change', update);

    // Recursive matchMedia pattern: re-create query on each DPR change
    function listenDpr() {
      const mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      const handler = () => {
        update();
        // Clean up old listener and create new one with updated DPR
        mql.removeEventListener('change', handler);
        listenDpr();
      };
      mql.addEventListener('change', handler);
      cleanupDprRef.current = () => mql.removeEventListener('change', handler);
    }
    listenDpr();

    return () => {
      window.removeEventListener('resize', throttledUpdate);
      screen.orientation?.removeEventListener('change', update);
      cleanupDprRef.current?.();
    };
  }, [update]);

  return info;
}
