import { Search, Filter } from 'lucide-react';
import SortableTable, { type Column } from '@/components/SortableTable';
import { useDevices } from '@/hooks/useDevices';
import type { Device } from '@/types';
import { useState, type ReactNode } from 'react';

const categoryLabels: Record<string, string> = {
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  watch: 'Watch',
  other: 'Other'
};

const columns: Column<Device>[] = [
  {
    key: 'name',
    header: 'Device',
    sortValue: (d) => `${d.brand} ${d.name}`,
    render: (d, hl?: (t: string) => ReactNode) => (
      <div>
        <span className="text-xs text-muted">{hl ? hl(d.brand) : d.brand}</span>
        <div className="font-medium">{hl ? hl(d.name) : d.name}</div>
      </div>
    )
  },
  {
    key: 'category',
    header: 'Type',
    sortValue: (d) => d.category,
    render: (d) => (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
        {categoryLabels[d.category] ?? d.category}
      </span>
    )
  },
  {
    key: 'year',
    header: 'Year',
    sortValue: (d) => d.releaseYear,
    render: (d) => <span className="text-sm tabular-nums">{d.releaseYear}</span>
  },
  {
    key: 'screen',
    header: 'Screen',
    sortValue: (d) => d.screenSize ?? 0,
    render: (d) => (
      <span className="font-mono text-sm tabular-nums">
        {d.screenSize ? `${d.screenSize}"` : '—'}
      </span>
    )
  },
  {
    key: 'resolution',
    header: 'Resolution',
    sortValue: (d) => d.resolution.width * d.resolution.height,
    render: (d) => (
      <span className="font-mono text-sm tabular-nums">
        {d.resolution.width}×{d.resolution.height}
      </span>
    )
  },
  {
    key: 'viewport',
    header: 'CSS Viewport',
    sortValue: (d) => d.cssViewport.width,
    render: (d) => (
      <span className="font-mono text-sm tabular-nums">
        {d.cssViewport.width}×{d.cssViewport.height}
      </span>
    )
  },
  {
    key: 'dpr',
    header: 'DPR',
    sortValue: (d) => d.devicePixelRatio,
    render: (d) => <span className="font-mono text-sm tabular-nums">{d.devicePixelRatio}×</span>
  },
  {
    key: 'ppi',
    header: 'PPI',
    sortValue: (d) => d.ppi ?? 0,
    render: (d) => <span className="font-mono text-sm tabular-nums">{d.ppi ?? '—'}</span>
  }
];

export default function Devices() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const {
    devices,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    brands,
    categories
  } = useDevices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="editorial-kicker">Device Archive</p>
        <div className="editorial-rule my-3" />
        <h1 className="font-display mb-1 text-4xl font-semibold tracking-tight text-primary-dark">
          Device Database
        </h1>
        <p className="text-muted">
          Screen specifications for popular devices &mdash; {devices.length} devices
        </p>
      </div>

      {/* Filters */}
      <div className="paper-panel mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="device-search" className="sr-only">
            Search devices
          </label>
          <input
            id="device-search"
            type="text"
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white/95 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          <label htmlFor="category-filter" className="sr-only">
            Filter by type
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">All types</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c] ?? c}
              </option>
            ))}
          </select>

          <label htmlFor="brand-filter" className="sr-only">
            Filter by brand
          </label>
          <select
            id="brand-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          {(['comfortable', 'compact'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDensity(mode)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                density === mode
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {mode === 'comfortable' ? 'Comfort' : 'Compact'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {devices.length > 0 ? (
        <SortableTable
          data={devices}
          columns={columns}
          rowKey={(d) => `${d.id}-${d.releaseYear}`}
          search={search}
          density={density}
          defaultSort={{ key: 'year', dir: 'desc' }}
        />
      ) : (
        <div className="paper-panel rounded-2xl p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <Search className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mb-1 font-medium text-gray-900 dark:text-gray-100">No devices found</p>
          <p className="text-sm text-muted">Try adjusting your search or filter criteria.</p>
          {(search || categoryFilter !== 'all' || brandFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setBrandFilter('all');
              }}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
