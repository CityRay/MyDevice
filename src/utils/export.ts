import type { ScreenInfo, FeatureResult, MediaQueryResult } from '@/types';
import { featureCategories } from '@/hooks/useFeatureDetection';
import { mediaQueryCategories } from '@/hooks/useMediaQueries';

export function buildCopyText(info: ScreenInfo): string {
  return [
    `Viewport: ${info.viewportWidth} × ${info.viewportHeight} px (${info.viewportWidthEm} × ${info.viewportHeightEm} em)`,
    `Screen: ${info.screenWidth} × ${info.screenHeight} px`,
    `Available: ${info.availWidth} × ${info.availHeight} px`,
    `Device Pixel Ratio: ${info.devicePixelRatio}`,
    `Color Depth: ${info.colorDepth}-bit`,
    `Orientation: ${info.orientation}`,
    `Root Font Size: ${info.rootFontSize}px`,
    `User Agent: ${info.userAgent}`
  ].join('\n');
}

export function buildJsonExport(
  info: ScreenInfo,
  features: FeatureResult[],
  mediaQueries: MediaQueryResult[]
): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      screen: {
        viewport: { width: info.viewportWidth, height: info.viewportHeight },
        viewportEm: { width: info.viewportWidthEm, height: info.viewportHeightEm },
        screen: { width: info.screenWidth, height: info.screenHeight },
        available: { width: info.availWidth, height: info.availHeight },
        colorDepth: info.colorDepth,
        devicePixelRatio: info.devicePixelRatio,
        orientation: info.orientation,
        rootFontSize: info.rootFontSize
      },
      userAgent: info.userAgent,
      features: features.reduce<Record<string, string>>((acc, f) => {
        acc[f.id] = f.status;
        return acc;
      }, {}),
      mediaQueries: mediaQueries.reduce<
        Record<string, { supported: MediaQueryResult['supported']; matches: boolean }>
      >((acc, mq) => {
        acc[mq.id] = {
          supported: mq.supported,
          matches: mq.matches
        };
        return acc;
      }, {})
    },
    null,
    2
  );
}

export function buildMarkdownExport(
  info: ScreenInfo,
  features: FeatureResult[],
  mediaQueries: MediaQueryResult[]
): string {
  const lines: string[] = [
    '# MyDevice Detection Report',
    '',
    `> Generated: ${new Date().toLocaleString()}`,
    '',
    '## Screen Information',
    '',
    `| Property | Value |`,
    `| --- | --- |`,
    `| Viewport | ${info.viewportWidth} × ${info.viewportHeight} px |`,
    `| Viewport (em) | ${info.viewportWidthEm} × ${info.viewportHeightEm} em |`,
    `| Screen | ${info.screenWidth} × ${info.screenHeight} px |`,
    `| Available | ${info.availWidth} × ${info.availHeight} px |`,
    `| Device Pixel Ratio | ${info.devicePixelRatio} |`,
    `| Color Depth | ${info.colorDepth}-bit |`,
    `| Orientation | ${info.orientation} |`,
    `| Root Font Size | ${info.rootFontSize}px |`,
    '',
    '## Feature Support',
    ''
  ];

  const grouped = features.reduce<Record<string, FeatureResult[]>>((acc, f) => {
    const arr = acc[f.category] ?? [];
    arr.push(f);
    acc[f.category] = arr;
    return acc;
  }, {});

  for (const [cat, items] of Object.entries(grouped)) {
    lines.push(`### ${featureCategories[cat] ?? cat}`);
    lines.push('');
    for (const f of items) {
      const icon = f.status === 'supported' ? '✅' : f.status === 'unsupported' ? '❌' : '❓';
      lines.push(`- ${icon} ${f.name}`);
    }
    lines.push('');
  }

  lines.push('## Media Queries', '');
  const mqGrouped = mediaQueries.reduce<Record<string, MediaQueryResult[]>>((acc, mq) => {
    const arr = acc[mq.category] ?? [];
    arr.push(mq);
    acc[mq.category] = arr;
    return acc;
  }, {});

  for (const [cat, items] of Object.entries(mqGrouped)) {
    lines.push(`### ${mediaQueryCategories[cat] ?? cat}`);
    lines.push('');
    for (const mq of items) {
      const supportIcon =
        mq.supported === 'supported' ? '✅' : mq.supported === 'unknown' ? '❓' : '❌';
      const matchLabel = mq.supported === 'supported' ? (mq.matches ? 'match' : 'no match') : 'n/a';
      lines.push(`- ${supportIcon} ${mq.label} (support: ${mq.supported}, state: ${matchLabel})`);
    }
    lines.push('');
  }

  lines.push('## User Agent', '', `\`${info.userAgent}\``);

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
