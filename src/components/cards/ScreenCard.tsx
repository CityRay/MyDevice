import { Monitor } from 'lucide-react';
import Card from '@/components/Card';
import CopyButton from '@/components/CopyButton';
import { Row } from '@/components/InfoDisplay';
import type { ScreenInfo } from '@/types';

export default function ScreenCard({ info }: { info: ScreenInfo }) {
  const summary = `Screen ${info.screenWidth}x${info.screenHeight}px | Available ${info.availWidth}x${info.availHeight}px`;

  return (
    <Card
      title="Screen"
      icon={<Monitor className="h-4 w-4" />}
      headerAction={
        <CopyButton text={summary} className="border border-black/10 bg-white/60 px-2.5 py-1" />
      }
    >
      <Row label="Width" value={info.screenWidth} unit="px" />
      <Row label="Height" value={info.screenHeight} unit="px" />
      <Row label="Avail Width" value={info.availWidth} unit="px" />
      <Row label="Avail Height" value={info.availHeight} unit="px" />
    </Card>
  );
}
