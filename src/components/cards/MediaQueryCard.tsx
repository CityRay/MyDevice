import { useMemo, useState } from 'react';
import { Activity, ChevronDown, ChevronRight } from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { mediaQueryCategories } from '@/hooks/useMediaQueries';
import type { MediaQueryResult } from '@/types';

type SupportFilter = 'all' | 'supported' | 'unsupported';
type StateFilter = 'all' | 'match' | 'no-match' | 'na';
type SortMode = 'default' | 'name' | 'support-first' | 'mismatch-first';

export default function MediaQueryCard({ mediaQueries }: { mediaQueries: MediaQueryResult[] }) {
  const [supportFilter, setSupportFilter] = useState<SupportFilter>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      mediaQueries.filter((mq) => {
        if (supportFilter === 'supported' && mq.supported !== 'supported') return false;
        if (supportFilter === 'unsupported' && mq.supported === 'supported') return false;

        if (stateFilter === 'match') return mq.supported === 'supported' && mq.matches;
        if (stateFilter === 'no-match') return mq.supported === 'supported' && !mq.matches;
        if (stateFilter === 'na') return mq.supported !== 'supported';

        return true;
      }),
    [mediaQueries, stateFilter, supportFilter]
  );

  const byCategory = useMemo(() => {
    const grouped = filtered.reduce<Record<string, MediaQueryResult[]>>((acc, mq) => {
      const arr = acc[mq.category] ?? [];
      arr.push(mq);
      acc[mq.category] = arr;
      return acc;
    }, {});

    const rank = (mq: MediaQueryResult): number => {
      if (mq.supported !== 'supported') return 2;
      return mq.matches ? 0 : 1;
    };

    for (const key of Object.keys(grouped)) {
      const current = grouped[key] ?? [];
      grouped[key] = [...current].sort((a, b) => {
        if (sortMode === 'name') return a.label.localeCompare(b.label);
        if (sortMode === 'support-first') return rank(a) - rank(b);
        if (sortMode === 'mismatch-first') return rank(b) - rank(a);
        return 0;
      });
    }

    return grouped;
  }, [filtered, sortMode]);

  const supportCounts = useMemo(
    () => ({
      supported: mediaQueries.filter((mq) => mq.supported === 'supported').length,
      unsupported: mediaQueries.filter((mq) => mq.supported !== 'supported').length
    }),
    [mediaQueries]
  );

  const stateCounts = useMemo(
    () => ({
      match: mediaQueries.filter((mq) => mq.supported === 'supported' && mq.matches).length,
      noMatch: mediaQueries.filter((mq) => mq.supported === 'supported' && !mq.matches).length,
      na: mediaQueries.filter((mq) => mq.supported !== 'supported').length
    }),
    [mediaQueries]
  );

  const isDirty = supportFilter !== 'all' || stateFilter !== 'all' || sortMode !== 'default';

  function handleReset() {
    setSupportFilter('all');
    setStateFilter('all');
    setSortMode('default');
    setExpanded({});
  }

  return (
    <Card title="Media Queries" icon={<Activity className="h-4 w-4" />}>
      <p className="mb-3 text-xs text-muted">
        Support = browser capability, State = current environment match.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: 'all', label: 'All', count: mediaQueries.length },
            { id: 'supported', label: 'Supported', count: supportCounts.supported },
            { id: 'unsupported', label: 'Unsupported', count: supportCounts.unsupported }
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setSupportFilter(item.id)}
            className={`rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
              supportFilter === item.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-muted">
          <span className="font-medium">Sort</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="default">Default</option>
            <option value="name">Name A-Z</option>
            <option value="support-first">Support / No match / N-A</option>
            <option value="mismatch-first">N-A / No match / Match</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty}
          className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-muted transition-colors enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 enabled:dark:hover:bg-gray-800"
        >
          Reset filters
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: 'all', label: 'All states', count: mediaQueries.length },
            { id: 'match', label: 'Match', count: stateCounts.match },
            { id: 'no-match', label: 'No match', count: stateCounts.noMatch },
            { id: 'na', label: 'N/A', count: stateCounts.na }
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setStateFilter(item.id)}
            className={`rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
              stateFilter === item.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="mb-3 last:mb-0">
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
            {mediaQueryCategories[cat] ?? cat}
          </h3>

          <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Query
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Support
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              State
            </span>
          </div>

          <div className="space-y-1">
            {items.map((mq) => (
              <div
                key={mq.id}
                className="rounded-md border border-transparent px-1 py-1 hover:border-gray-200 dark:hover:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [mq.id]: !prev[mq.id] }))}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-left"
                >
                  <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted">
                    {expanded[mq.id] ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate" title={mq.query}>
                      {mq.label}
                    </span>
                  </span>
                  <Badge
                    status={mq.supported}
                    labelSupported="Support"
                    labelUnsupported="No support"
                  />
                  <Badge
                    status={mq.supported === 'supported' && mq.matches}
                    labelSupported="Match"
                    labelUnsupported={mq.supported === 'supported' ? 'No match' : 'N/A'}
                  />
                </button>

                {expanded[mq.id] && (
                  <div className="mt-1 rounded bg-gray-50 px-2 py-1 dark:bg-gray-800/70">
                    <p className="text-[11px] text-muted">Raw query</p>
                    <code className="block break-all font-mono text-[11px]">{mq.query}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-xs text-muted">No media queries match the selected filters.</p>
      )}
    </Card>
  );
}
