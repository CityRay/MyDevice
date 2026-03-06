import { useState, useMemo } from 'react';
import type { Device } from '@/types';

import rawDevices from '@/data/devices.json';

const devices = rawDevices as Device[];

function sortNewestFirst(a: Device, b: Device): number {
  if (a.releaseYear !== b.releaseYear) return b.releaseYear - a.releaseYear;
  if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
  return a.name.localeCompare(b.name);
}

export function useDevices() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const normalizedDevices = useMemo(() => {
    // Keep the latest occurrence when duplicated IDs exist in source data.
    const deduped = new Map<string, Device>();
    for (const d of devices) deduped.set(d.id, d);
    return [...deduped.values()].sort(sortNewestFirst);
  }, []);

  const categories = useMemo(
    () => [...new Set(normalizedDevices.map((d) => d.category))].sort(),
    [normalizedDevices]
  );

  const brandsSorted = useMemo(
    () => [...new Set(normalizedDevices.map((d) => d.brand))].sort(),
    [normalizedDevices]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return normalizedDevices.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (brandFilter !== 'all' && d.brand !== brandFilter) return false;
      if (q && !`${d.brand} ${d.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [normalizedDevices, search, categoryFilter, brandFilter]);

  return {
    devices: filtered,
    allDevices: normalizedDevices,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    brands: brandsSorted,
    categories
  };
}
