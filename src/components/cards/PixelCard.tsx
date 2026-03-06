import { Ratio } from 'lucide-react';
import Card from '@/components/Card';
import CopyButton from '@/components/CopyButton';
import { Row } from '@/components/InfoDisplay';
import type { ScreenInfo } from '@/types';

export default function PixelCard({ info }: { info: ScreenInfo }) {
  const physicalWidth = Math.round(info.viewportWidth * info.devicePixelRatio);
  const physicalHeight = Math.round(info.viewportHeight * info.devicePixelRatio);
  const summary = `DPR ${info.devicePixelRatio}x | Color depth ${info.colorDepth}bit | Physical ${physicalWidth}x${physicalHeight}px`;

  return (
    <Card
      title="Pixel & Density"
      icon={<Ratio className="h-4 w-4" />}
      headerAction={
        <CopyButton text={summary} className="border border-black/10 bg-white/60 px-2.5 py-1" />
      }
    >
      <Row label="Device Pixel Ratio" value={info.devicePixelRatio} />
      <Row label="Color Depth" value={info.colorDepth} unit="bit" />
      <Row label="Physical Width" value={physicalWidth} unit="px" />
      <Row label="Physical Height" value={physicalHeight} unit="px" />
      <Row label="Root Font Size" value={info.rootFontSize} unit="px" />
    </Card>
  );
}
