/* ── Value row helper ── */

export function Row({
  label,
  value,
  unit
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>}
      </span>
    </div>
  );
}

/* ── Stat highlight ── */

export function Stat({
  label,
  value,
  unit,
  accent
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold tabular-nums sm:text-3xl ${accent ? 'text-accent' : ''}`}>
        {value}
        {unit && <span className="ml-0.5 text-base font-normal text-muted">{unit}</span>}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
