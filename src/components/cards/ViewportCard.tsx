import { Maximize } from 'lucide-react';
import Card from '@/components/Card';
import CopyButton from '@/components/CopyButton';
import { Row } from '@/components/InfoDisplay';
import type { ScreenInfo } from '@/types';

export default function ViewportCard({ info }: { info: ScreenInfo }) {
  const summary = `Viewport ${info.viewportWidth}x${info.viewportHeight}px (${info.viewportWidthEm}x${info.viewportHeightEm}em)`;

  return (
    <Card
      title="Viewport"
      icon={<Maximize className="h-4 w-4" />}
      headerAction={
        <CopyButton text={summary} className="border border-black/10 bg-white/60 px-2.5 py-1" />
      }
    >
      <Row label="Width" value={info.viewportWidth} unit="px" />
      <Row label="Height" value={info.viewportHeight} unit="px" />
      <Row label="Width (em)" value={info.viewportWidthEm} unit="em" />
      <Row label="Height (em)" value={info.viewportHeightEm} unit="em" />
    </Card>
  );
}
