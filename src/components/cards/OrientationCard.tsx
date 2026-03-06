import { Compass } from 'lucide-react';
import Card from '@/components/Card';
import CopyButton from '@/components/CopyButton';
import { Row } from '@/components/InfoDisplay';
import type { ScreenInfo } from '@/types';

export default function OrientationCard({ info }: { info: ScreenInfo }) {
  const summary = `Orientation ${info.orientation} | Aspect ${info.viewportWidth}:${info.viewportHeight}`;

  return (
    <Card
      title="Orientation"
      icon={<Compass className="h-4 w-4" />}
      headerAction={
        <CopyButton text={summary} className="border border-black/10 bg-white/60 px-2.5 py-1" />
      }
    >
      <Row label="Type" value={info.orientation} />
      <Row label="Aspect Ratio" value={`${info.viewportWidth} : ${info.viewportHeight}`} />
    </Card>
  );
}
