import { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import Badge from '@/components/Badge';
import { useFeatureDetection, featureCategories } from '@/hooks/useFeatureDetection';
import type { FeatureResult, FeatureCategory } from '@/types';

const categoryOrder: FeatureCategory[] = [
  'css-layout',
  'css-visual',
  'css-responsive',
  'js-api',
  'media',
  'performance',
  'accessibility'
];

function StatusIcon({ status }: { status: FeatureResult['status'] }) {
  switch (status) {
    case 'supported':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'unsupported':
      return <XCircle className="h-4 w-4 text-danger" />;
    default:
      return <HelpCircle className="h-4 w-4 text-warning" />;
  }
}

export default function Features() {
  const features = useFeatureDetection();
  const [filter, setFilter] = useState<'all' | 'supported' | 'unsupported'>('all');

  const grouped = categoryOrder.reduce<Record<string, FeatureResult[]>>((acc, cat) => {
    acc[cat] = features.filter((f) => {
      if (f.category !== cat) return false;
      if (filter === 'supported' && f.status !== 'supported') return false;
      if (filter === 'unsupported' && f.status !== 'unsupported') return false;
      return true;
    });
    return acc;
  }, {});

  const stats = {
    total: features.length,
    supported: features.filter((f) => f.status === 'supported').length,
    unsupported: features.filter((f) => f.status === 'unsupported').length
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="editorial-kicker">Capability Matrix</p>
        <div className="editorial-rule my-3" />
        <h1 className="font-display mb-1 text-4xl font-semibold tracking-tight text-primary-dark">
          Browser Feature Detection
        </h1>
        <p className="text-muted">CSS &amp; JavaScript feature support in your current browser</p>
      </div>

      {/* Stats bar */}
      <div className="paper-panel mb-6 flex flex-wrap items-center gap-6 rounded-2xl px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <span className="text-2xl font-bold text-success">{stats.supported}</span>
          <span className="ml-1 text-sm text-muted">supported</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-danger">{stats.unsupported}</span>
          <span className="ml-1 text-sm text-muted">unsupported</span>
        </div>
        <div>
          <span className="text-2xl font-bold">{stats.total}</span>
          <span className="ml-1 text-sm text-muted">total features</span>
        </div>

        <div className="ml-auto flex gap-1">
          {(['all', 'supported', 'unsupported'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-black/5 dark:hover:bg-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feature groups */}
      <div className="space-y-8">
        {categoryOrder.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;

          return (
            <section key={cat}>
              <h2 className="mb-3 text-lg font-semibold">{featureCategories[cat]}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                  <div
                    key={f.id}
                    className="paper-panel flex items-start gap-3 rounded-xl p-4 transition-shadow hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <StatusIcon status={f.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{f.name}</span>
                        <Badge status={f.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{f.description}</p>
                      {f.mdnUrl && (
                        <a
                          href={f.mdnUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          MDN Docs
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
