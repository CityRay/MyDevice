/* ── Screen & Viewport ── */

export interface ScreenInfo {
  viewportWidth: number;
  viewportHeight: number;
  viewportWidthEm: number;
  viewportHeightEm: number;
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  devicePixelRatio: number;
  orientation: string;
  rootFontSize: number;
  userAgent: string;
}

/* ── Feature Detection ── */

export type FeatureStatus = 'supported' | 'unsupported' | 'unknown';

export interface FeatureItem {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  mdnUrl?: string;
  detect: () => FeatureStatus;
}

export type FeatureCategory =
  | 'css-layout'
  | 'css-visual'
  | 'css-responsive'
  | 'js-api'
  | 'media'
  | 'performance'
  | 'accessibility';

export interface FeatureResult extends FeatureItem {
  status: FeatureStatus;
}

/* ── Media Queries ── */

export interface MediaQueryItem {
  id: string;
  label: string;
  query: string;
  category: 'preference' | 'display' | 'interaction' | 'color';
}

export interface MediaQueryResult extends MediaQueryItem {
  supported: FeatureStatus;
  matches: boolean;
}

/* ── Device Database ── */

export interface Device {
  id: string;
  brand: string;
  name: string;
  category: DeviceCategory;
  releaseYear: number;
  screenSize?: number;
  resolution: { width: number; height: number };
  cssViewport: { width: number; height: number };
  devicePixelRatio: number;
  ppi?: number;
  platform: string;
  osVersion?: string;
}

export type DeviceCategory = 'smartphone' | 'tablet' | 'laptop' | 'watch' | 'other';
