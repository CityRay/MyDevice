import { useState, useMemo, type ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, highlight?: (text: string) => ReactNode) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  search?: string;
  density?: 'comfortable' | 'compact';
  defaultSort?: {
    key: string;
    dir?: SortDir;
  };
}

type SortDir = 'asc' | 'desc';

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-accent/20 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SortableTable<T>({
  data,
  columns,
  rowKey,
  search = '',
  density = 'comfortable',
  defaultSort
}: SortableTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.dir ?? 'asc');

  const highlight = useMemo(() => {
    if (!search) return undefined;
    return (text: string) => <HighlightText text={text} query={search} />;
  }, [search]);

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col?.sortValue) return data;

    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, sortCol, sortDir]);

  function handleSort(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  }

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortCol !== colKey) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-accent" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-accent" />
    );
  };

  return (
    <div className="paper-panel overflow-x-auto rounded-xl dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-black/5 dark:border-gray-800 dark:bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`font-medium text-muted ${density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3'}`}
                aria-sort={
                  sortCol === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                }
              >
                {col.sortValue ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    {col.header}
                    <SortIcon colKey={col.key} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              {columns.map((col) => (
                <td key={col.key} className={density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'}>
                  {col.render(row, highlight)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
