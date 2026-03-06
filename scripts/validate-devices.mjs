import fs from 'node:fs';
import path from 'node:path';

const VALID_CATEGORIES = new Set(['smartphone', 'tablet', 'laptop', 'watch', 'other']);
const currentYear = new Date().getFullYear();

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, 'src', 'data', 'devices.json');

function parseMode(argv) {
  if (argv.includes('--report')) return 'report';
  return 'strict';
}

function readDevices(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('devices.json must contain a JSON array.');
  }
  return parsed;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validateDeviceShape(device, index, errors) {
  const prefix = `[#${index}]`;

  if (!device || typeof device !== 'object') {
    errors.push(`${prefix} entry must be an object.`);
    return;
  }

  if (typeof device.id !== 'string' || device.id.trim() === '') {
    errors.push(`${prefix} missing or invalid id.`);
  }

  if (typeof device.brand !== 'string' || device.brand.trim() === '') {
    errors.push(`${prefix} missing or invalid brand.`);
  }

  if (typeof device.name !== 'string' || device.name.trim() === '') {
    errors.push(`${prefix} missing or invalid name.`);
  }

  if (!VALID_CATEGORIES.has(device.category)) {
    errors.push(`${prefix} invalid category: ${String(device.category)}.`);
  }

  if (
    !Number.isInteger(device.releaseYear) ||
    device.releaseYear < 1990 ||
    device.releaseYear > currentYear + 1
  ) {
    errors.push(`${prefix} invalid releaseYear: ${String(device.releaseYear)}.`);
  }

  if (!device.resolution || typeof device.resolution !== 'object') {
    errors.push(`${prefix} missing resolution object.`);
  } else {
    if (!isPositiveNumber(device.resolution.width)) {
      errors.push(`${prefix} invalid resolution.width: ${String(device.resolution.width)}.`);
    }
    if (!isPositiveNumber(device.resolution.height)) {
      errors.push(`${prefix} invalid resolution.height: ${String(device.resolution.height)}.`);
    }
  }

  if (!device.cssViewport || typeof device.cssViewport !== 'object') {
    errors.push(`${prefix} missing cssViewport object.`);
  } else {
    if (!isPositiveNumber(device.cssViewport.width)) {
      errors.push(`${prefix} invalid cssViewport.width: ${String(device.cssViewport.width)}.`);
    }
    if (!isPositiveNumber(device.cssViewport.height)) {
      errors.push(`${prefix} invalid cssViewport.height: ${String(device.cssViewport.height)}.`);
    }
  }

  if (!isPositiveNumber(device.devicePixelRatio) || device.devicePixelRatio > 10) {
    errors.push(`${prefix} invalid devicePixelRatio: ${String(device.devicePixelRatio)}.`);
  }

  if (device.ppi !== undefined && (!isPositiveNumber(device.ppi) || device.ppi > 2000)) {
    errors.push(`${prefix} invalid ppi: ${String(device.ppi)}.`);
  }

  if (typeof device.platform !== 'string' || device.platform.trim() === '') {
    errors.push(`${prefix} missing or invalid platform.`);
  }

  if (device.osVersion !== undefined && typeof device.osVersion !== 'string') {
    errors.push(`${prefix} invalid osVersion: must be a string when provided.`);
  }
}

function validateUniqueIds(devices, errors) {
  const idMap = new Map();

  for (let i = 0; i < devices.length; i += 1) {
    const id = devices[i]?.id;
    if (typeof id !== 'string' || id.trim() === '') continue;

    if (!idMap.has(id)) {
      idMap.set(id, [i]);
    } else {
      idMap.get(id).push(i);
    }
  }

  for (const [id, indexes] of idMap.entries()) {
    if (indexes.length > 1) {
      errors.push(`duplicate id \"${id}\" at indexes: ${indexes.join(', ')}.`);
    }
  }
}

function buildSummary(devices) {
  const byCategory = new Map();
  const byBrand = new Map();
  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = Number.NEGATIVE_INFINITY;

  for (const d of devices) {
    if (typeof d?.category === 'string') {
      byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
    }
    if (typeof d?.brand === 'string') {
      byBrand.set(d.brand, (byBrand.get(d.brand) ?? 0) + 1);
    }
    if (Number.isInteger(d?.releaseYear)) {
      minYear = Math.min(minYear, d.releaseYear);
      maxYear = Math.max(maxYear, d.releaseYear);
    }
  }

  const topBrands = [...byBrand.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10);

  return {
    total: devices.length,
    yearRange:
      Number.isFinite(minYear) && Number.isFinite(maxYear) ? `${minYear}-${maxYear}` : 'n/a',
    byCategory: [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    topBrands
  };
}

function printSummary(summary) {
  console.log(`[devices:validate] Dataset summary`);
  console.log(`- total: ${summary.total}`);
  console.log(`- yearRange: ${summary.yearRange}`);
  console.log(`- categories:`);
  for (const [category, count] of summary.byCategory) {
    console.log(`  - ${category}: ${count}`);
  }
  console.log(`- topBrands:`);
  for (const [brand, count] of summary.topBrands) {
    console.log(`  - ${brand}: ${count}`);
  }
}

function main() {
  const mode = parseMode(process.argv.slice(2));
  let devices;
  try {
    devices = readDevices(dataPath);
  } catch (error) {
    console.error('[devices:validate] Failed to read devices.json');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const errors = [];

  for (let i = 0; i < devices.length; i += 1) {
    validateDeviceShape(devices[i], i, errors);
  }

  validateUniqueIds(devices, errors);

  const summary = buildSummary(devices);

  if (mode === 'report') {
    printSummary(summary);
    if (errors.length > 0) {
      console.warn(`[devices:validate] report mode found ${errors.length} issue(s):`);
      for (const err of errors) {
        console.warn(`- ${err}`);
      }
    } else {
      console.log('[devices:validate] report mode found no issues.');
    }
    process.exit(0);
  }

  if (errors.length > 0) {
    console.error(`[devices:validate] Found ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  printSummary(summary);
  console.log(`[devices:validate] OK (${devices.length} devices)`);
}

main();
