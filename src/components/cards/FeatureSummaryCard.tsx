import { Link } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import Card from '@/components/Card';
import type { FeatureResult } from '@/types';
import { featureCategories } from '@/hooks/useFeatureDetection';

export default function FeatureSummaryCard({ features }: { features: FeatureResult[] }) {
  const summary = features.reduce<Record<string, { supported: number; total: number }>>(
    (acc, f) => {
      const cat = f.category;
      if (!acc[cat]) acc[cat] = { supported: 0, total: 0 };
      acc[cat].total++;
      if (f.status === 'supported') acc[cat].supported++;
      return acc;
    },
    {}
  );

  return (
    <Card title="Feature Support" icon={<Fingerprint className="h-4 w-4" />}>
      {Object.entries(summary).map(([cat, s]) => (
        <div
          key={cat}
          className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-800"
        >
          <span className="text-sm text-muted">{featureCategories[cat] ?? cat}</span>
          <span className="font-mono text-sm">
            <span className="font-semibold text-success">{s.supported}</span>
            <span className="text-muted">/{s.total}</span>
          </span>
        </div>
      ))}
      <p className="mt-3 text-xs text-muted">
        See{' '}
        <Link to="/features" className="text-accent underline">
          Features
        </Link>{' '}
        page for full details
      </p>
    </Card>
  );
}
