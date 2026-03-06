import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, 'src', 'data', 'devices.json');

function readDevices(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('devices.json must contain a JSON array.');
  }
  return parsed;
}

function sortNewestFirst(a, b) {
  if (a.releaseYear !== b.releaseYear) return b.releaseYear - a.releaseYear;
  if (a.brand !== b.brand) return String(a.brand).localeCompare(String(b.brand));
  return String(a.name).localeCompare(String(b.name));
}

function normalizeDevices(devices) {
  const deduped = new Map();
  for (const d of devices) {
    if (!d || typeof d !== 'object') continue;
    const id = d.id;
    if (typeof id !== 'string' || id.trim() === '') continue;
    // Keep last occurrence to align with runtime dedupe behavior.
    deduped.set(id, d);
  }

  return [...deduped.values()].sort(sortNewestFirst);
}

function main() {
  let devices;
  try {
    devices = readDevices(dataPath);
  } catch (error) {
    console.error('[devices:normalize] Failed to read devices.json');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const beforeCount = devices.length;
  const normalized = normalizeDevices(devices);
  const afterCount = normalized.length;
  const removed = beforeCount - afterCount;

  fs.writeFileSync(dataPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  console.log('[devices:normalize] Completed');
  console.log(`- before: ${beforeCount}`);
  console.log(`- after: ${afterCount}`);
  console.log(`- removed duplicates: ${removed}`);
}

main();
