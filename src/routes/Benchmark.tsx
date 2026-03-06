import { useState, useCallback } from 'react';
import { Zap, Play, RotateCcw, Download, Trash2 } from 'lucide-react';
import { downloadFile } from '@/utils/export';
import { useToast } from '@/hooks/useToast';

interface BenchmarkResult {
  name: string;
  score: number;
  unit: string;
  description: string;
  samples?: number[];
  bestScore?: number;
  runs?: number;
}

interface BenchmarkEnvironment {
  viewport: string;
  pixelRatio: string;
  logicalCores: string;
  deviceMemory: string;
  language: string;
  userAgent: string;
}

interface BenchmarkSnapshot {
  timestamp: string;
  environment: BenchmarkEnvironment;
  totalTime: number | null;
  results: BenchmarkResult[];
}

type BenchmarkRunner = () => BenchmarkResult | Promise<BenchmarkResult>;

const BENCHMARK_RUNS = 3;
const BENCHMARK_HISTORY_KEY = 'mydevice-benchmark-history-v1';

function runDomBenchmark(): BenchmarkResult {
  const iterations = 5000;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const el = document.createElement('div');
    el.textContent = `item-${i}`;
    container.appendChild(el);
  }
  container.remove();
  const elapsed = performance.now() - start;
  return {
    name: 'DOM Operations',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `Create and insert ${iterations.toLocaleString()} DOM elements`
  };
}

function runMathBenchmark(): BenchmarkResult {
  const iterations = 1_000_000;
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  // Prevent dead-code elimination
  if (sum === Infinity) console.log(sum);
  const elapsed = performance.now() - start;
  return {
    name: 'Math Operations',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `Run ${iterations.toLocaleString()} sqrt/sin/cos calculations`
  };
}

function runArrayBenchmark(): BenchmarkResult {
  const size = 100_000;
  const arr = Array.from({ length: size }, () => Math.random());
  const start = performance.now();
  arr.sort((a, b) => a - b);
  arr.filter((x) => x > 0.5);
  arr.map((x) => x * 2);
  arr.reduce((acc, x) => acc + x, 0);
  const elapsed = performance.now() - start;
  return {
    name: 'Array Processing',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `Sort, filter, map, and reduce ${size.toLocaleString()} elements`
  };
}

function runJsonBenchmark(): BenchmarkResult {
  const data = Array.from({ length: 10_000 }, (_, i) => ({
    id: i,
    name: `item-${i}`,
    value: Math.random(),
    nested: { a: i, b: `str-${i}` }
  }));
  const iterations = 50;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const str = JSON.stringify(data);
    JSON.parse(str);
  }
  const elapsed = performance.now() - start;
  return {
    name: 'JSON Serialization',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `Serialize and parse 10K objects × ${iterations}`
  };
}

function runCanvasBenchmark(): BenchmarkResult {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx)
    return { name: 'Canvas 2D', score: -1, unit: 'ms', description: 'Canvas is not supported' };

  const iterations = 5000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    ctx.fillStyle = `hsl(${i % 360}, 70%, 50%)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 800, Math.random() * 600, Math.random() * 50 + 5, 0, Math.PI * 2);
    ctx.fill();
  }
  const elapsed = performance.now() - start;
  return {
    name: 'Canvas 2D',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `Draw ${iterations.toLocaleString()} random circles`
  };
}

function runWebGLBenchmark(): BenchmarkResult {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
  if (!gl) return { name: 'WebGL', score: -1, unit: 'ms', description: 'WebGL is not supported' };

  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    (gl as WebGLRenderingContext).clearColor(Math.random(), Math.random(), Math.random(), 1);
    (gl as WebGLRenderingContext).clear((gl as WebGLRenderingContext).COLOR_BUFFER_BIT);
  }
  const elapsed = performance.now() - start;
  return {
    name: 'WebGL',
    score: Math.round(elapsed * 100) / 100,
    unit: 'ms',
    description: `${iterations.toLocaleString()} clear calls`
  };
}

async function runWorkerBenchmark(): Promise<BenchmarkResult> {
  if (typeof Worker === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return {
      name: 'Web Worker',
      score: -1,
      unit: 'ms',
      description: 'Web Workers are not supported'
    };
  }

  const workerScript = `
    self.onmessage = () => {
      const iterations = 1000000;
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
      }
      const elapsed = performance.now() - start;
      self.postMessage({ elapsed, sum });
    };
  `;

  const blob = new Blob([workerScript], { type: 'text/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);

  try {
    const elapsed = await new Promise<number>((resolve, reject) => {
      const overallStart = performance.now();

      worker.onmessage = () => {
        resolve(performance.now() - overallStart);
      };

      worker.onerror = () => {
        reject(new Error('Worker execution failed'));
      };

      worker.postMessage({ start: true });
    });

    return {
      name: 'Web Worker',
      score: roundScore(elapsed),
      unit: 'ms',
      description: 'Execute 1,000,000 math operations off the main thread'
    };
  } catch {
    return {
      name: 'Web Worker',
      score: -1,
      unit: 'ms',
      description: 'Worker execution failed or was blocked'
    };
  } finally {
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }
}

function runStorageBenchmark(): BenchmarkResult {
  const storage = window.localStorage;
  if (!storage) {
    return {
      name: 'Storage I/O',
      score: -1,
      unit: 'ms',
      description: 'localStorage is not supported'
    };
  }

  const key = `mydevice-benchmark-${Date.now()}`;
  const payload = JSON.stringify(
    Array.from({ length: 200 }, (_, i) => ({
      id: i,
      label: `entry-${i}`,
      value: Math.random()
    }))
  );
  const iterations = 25;

  try {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      storage.setItem(key, payload);
      storage.getItem(key);
    }
    const elapsed = performance.now() - start;
    return {
      name: 'Storage I/O',
      score: roundScore(elapsed),
      unit: 'ms',
      description: `Write and read localStorage ${iterations} times`
    };
  } catch {
    return {
      name: 'Storage I/O',
      score: -1,
      unit: 'ms',
      description: 'localStorage is unavailable in this browsing context'
    };
  } finally {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore cleanup failures from restricted storage contexts.
    }
  }
}

function runLayoutThrashBenchmark(): BenchmarkResult {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '320px';
  document.body.appendChild(container);

  for (let i = 0; i < 120; i++) {
    const row = document.createElement('div');
    row.style.height = `${12 + (i % 7)}px`;
    row.style.marginBottom = '1px';
    container.appendChild(row);
  }

  const iterations = 500;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const target = container.children[i % container.children.length] as HTMLElement;
    target.style.width = `${140 + (i % 80)}px`;
    void target.offsetHeight;
  }
  const elapsed = performance.now() - start;
  container.remove();

  return {
    name: 'Layout Thrash',
    score: roundScore(elapsed),
    unit: 'ms',
    description: `Interleave ${iterations} layout writes and forced reads`
  };
}

async function runFrameTimingBenchmark(): Promise<BenchmarkResult> {
  const sampleFrames = 120;

  if (typeof window.requestAnimationFrame !== 'function') {
    return {
      name: 'Frame Timing',
      score: -1,
      unit: 'ms',
      description: 'requestAnimationFrame is not supported'
    };
  }

  const frameDeltas: number[] = [];
  let previousTime = 0;

  await new Promise<void>((resolve) => {
    const step = (timestamp: number) => {
      if (previousTime > 0) {
        frameDeltas.push(timestamp - previousTime);
      }
      previousTime = timestamp;

      if (frameDeltas.length >= sampleFrames) {
        resolve();
        return;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  });

  const averageFrameTime = roundScore(
    frameDeltas.reduce((sum, value) => sum + value, 0) / frameDeltas.length
  );
  const droppedFrames = frameDeltas.filter((value) => value > 20).length;

  return {
    name: 'Frame Timing',
    score: averageFrameTime,
    unit: 'ms',
    description: `Sample ${sampleFrames} frames; ${droppedFrames} frames exceeded 20 ms`
  };
}

function getMemoryInfo(): BenchmarkResult | null {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
  };
  if (!perf.memory) return null;
  return {
    name: 'Memory Usage',
    score: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
    unit: 'MB',
    description: `JS heap limit ${Math.round(perf.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
  };
}

const allBenchmarks: BenchmarkRunner[] = [
  runDomBenchmark,
  runMathBenchmark,
  runArrayBenchmark,
  runJsonBenchmark,
  runStorageBenchmark,
  runCanvasBenchmark,
  runWebGLBenchmark,
  runWorkerBenchmark,
  runFrameTimingBenchmark,
  runLayoutThrashBenchmark
];

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateTotalTime(results: BenchmarkResult[]): number | null {
  if (results.length === 0) return null;
  return roundScore(results.filter((r) => r.unit === 'ms').reduce((acc, r) => acc + r.score, 0));
}

function readBenchmarkSnapshot(): BenchmarkSnapshot | null {
  try {
    const raw = window.localStorage.getItem(BENCHMARK_HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BenchmarkSnapshot;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.results)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistBenchmarkSnapshot(snapshot: BenchmarkSnapshot): void {
  try {
    window.localStorage.setItem(BENCHMARK_HISTORY_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }
}

function clearBenchmarkSnapshot(): void {
  try {
    window.localStorage.removeItem(BENCHMARK_HISTORY_KEY);
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getResultDelta(current: BenchmarkResult, previous?: BenchmarkResult): number | null {
  if (!previous) return null;
  if (current.unit !== previous.unit) return null;
  if (current.score < 0 || previous.score < 0) return null;
  return roundScore(current.score - previous.score);
}

function deltaLabel(delta: number, unit: string): string {
  const prefix = delta > 0 ? '+' : '';
  return `${prefix}${delta} ${unit} vs last run`;
}

function deltaTone(delta: number): string {
  if (delta < 0) return 'text-success';
  if (delta > 0) return 'text-danger';
  return 'text-muted';
}

function buildBenchmarkJsonExport(
  results: BenchmarkResult[],
  environment: BenchmarkEnvironment
): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      environment,
      runsPerBenchmark: BENCHMARK_RUNS,
      results: results.map((result) => ({
        name: result.name,
        score: result.score,
        unit: result.unit,
        description: result.description,
        bestScore: result.bestScore ?? null,
        runs: result.runs ?? null,
        samples: result.samples ?? null
      }))
    },
    null,
    2
  );
}

function buildBenchmarkMarkdownExport(
  results: BenchmarkResult[],
  environment: BenchmarkEnvironment,
  totalTime: number | null
): string {
  const lines = [
    '# MyDevice Benchmark Report',
    '',
    `> Generated: ${new Date().toLocaleString()}`,
    '',
    '## Environment',
    '',
    `| Property | Value |`,
    `| --- | --- |`,
    `| Viewport | ${environment.viewport} |`,
    `| Pixel Ratio | ${environment.pixelRatio} |`,
    `| Logical Cores | ${environment.logicalCores} |`,
    `| Device Memory | ${environment.deviceMemory} |`,
    `| Language | ${environment.language} |`,
    `| User Agent | ${environment.userAgent.replace(/\|/g, '\\|')} |`,
    '',
    '## Results',
    '',
    `| Benchmark | Score | Best | Runs | Notes |`,
    `| --- | --- | --- | --- | --- |`
  ];

  for (const result of results) {
    const score = result.score < 0 ? 'N/A' : `${result.score} ${result.unit}`;
    const best = result.bestScore !== undefined ? `${result.bestScore} ${result.unit}` : '—';
    const runs = result.runs ?? '—';
    lines.push(`| ${result.name} | ${score} | ${best} | ${runs} | ${result.description} |`);
  }

  if (totalTime !== null) {
    lines.push('', `**Total Time:** ${totalTime} ms`);
  }

  lines.push(
    '',
    '## Note',
    '',
    'These are synthetic browser benchmarks intended for relative comparison, not absolute device rankings.'
  );

  return lines.join('\n');
}

async function runBenchmarkWithSamples(
  run: BenchmarkRunner,
  runs = BENCHMARK_RUNS
): Promise<BenchmarkResult> {
  const first = await run();
  if (first.score < 0 || first.unit !== 'ms') {
    return { ...first, runs: 1 };
  }

  const samples = [first.score];
  for (let i = 1; i < runs; i++) {
    const result = await run();
    samples.push(result.score);
  }

  const average = roundScore(samples.reduce((sum, value) => sum + value, 0) / samples.length);
  const best = roundScore(Math.min(...samples));

  return {
    ...first,
    score: average,
    bestScore: best,
    runs: samples.length,
    samples
  };
}

function getEnvironmentSummary(): BenchmarkEnvironment {
  const nav = navigator as Navigator & { deviceMemory?: number };

  return {
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    pixelRatio: `${window.devicePixelRatio || 1}x`,
    logicalCores:
      typeof nav.hardwareConcurrency === 'number' ? String(nav.hardwareConcurrency) : 'Unavailable',
    deviceMemory: typeof nav.deviceMemory === 'number' ? `${nav.deviceMemory} GB` : 'Unavailable',
    language: nav.language || 'Unavailable',
    userAgent: nav.userAgent || 'Unavailable'
  };
}

function scoreColor(score: number, unit: string): string {
  if (unit === 'MB') return 'bg-blue-500';
  if (score < 0) return 'bg-gray-400';
  if (score < 50) return 'bg-green-500';
  if (score < 200) return 'bg-yellow-500';
  if (score < 500) return 'bg-orange-500';
  return 'bg-red-500';
}

function scoreLabel(score: number, unit: string): string {
  if (unit === 'MB') return '—';
  if (score < 0) return 'Unsupported';
  if (score < 50) return 'Excellent';
  if (score < 200) return 'Fast';
  if (score < 500) return 'Average';
  return 'Slow';
}

function barWidth(score: number, unit: string): string {
  if (unit === 'MB' || score < 0) return '100%';
  const pct = Math.min(100, (score / 1000) * 100);
  return `${Math.max(5, pct)}%`;
}

export default function Benchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [environment] = useState<BenchmarkEnvironment>(() => getEnvironmentSummary());
  const [previousSnapshot, setPreviousSnapshot] = useState<BenchmarkSnapshot | null>(() =>
    readBenchmarkSnapshot()
  );
  const [comparisonSnapshot, setComparisonSnapshot] = useState<BenchmarkSnapshot | null>(() =>
    readBenchmarkSnapshot()
  );
  const { showToast } = useToast();

  const runAll = useCallback(() => {
    setRunning(true);
    setResults([]);
    setComparisonSnapshot(previousSnapshot);

    // Run benchmarks sequentially via setTimeout to keep UI responsive
    let index = 0;
    const collected: BenchmarkResult[] = [];

    async function next() {
      if (index < allBenchmarks.length) {
        const fn = allBenchmarks[index]!;
        collected.push(await runBenchmarkWithSamples(fn));
        setResults([...collected]);
        index++;
        setTimeout(next, 50);
      } else {
        const mem = getMemoryInfo();
        if (mem) {
          collected.push(mem);
          setResults([...collected]);
        }
        const snapshot: BenchmarkSnapshot = {
          timestamp: new Date().toISOString(),
          environment,
          totalTime: calculateTotalTime(collected),
          results: [...collected]
        };
        persistBenchmarkSnapshot(snapshot);
        setPreviousSnapshot(snapshot);
        setRunning(false);
      }
    }

    setTimeout(next, 100);
  }, [environment, previousSnapshot]);

  const handleDownloadJson = useCallback(() => {
    if (results.length === 0) return;
    downloadFile(
      buildBenchmarkJsonExport(results, environment),
      `mydevice-benchmark-${Date.now()}.json`,
      'application/json'
    );
    showToast('success', 'Benchmark JSON downloaded.');
  }, [environment, results, showToast]);

  const handleDownloadMarkdown = useCallback(() => {
    if (results.length === 0) return;
    const total =
      Math.round(
        results.filter((r) => r.unit === 'ms').reduce((acc, r) => acc + r.score, 0) * 100
      ) / 100;
    downloadFile(
      buildBenchmarkMarkdownExport(results, environment, total),
      `mydevice-benchmark-${Date.now()}.md`,
      'text/markdown;charset=utf-8'
    );
    showToast('success', 'Benchmark Markdown downloaded.');
  }, [environment, results, showToast]);

  const handleClearHistory = useCallback(() => {
    clearBenchmarkSnapshot();
    setPreviousSnapshot(null);
    setComparisonSnapshot(null);
    showToast('info', 'Benchmark history cleared.');
  }, [showToast]);

  function handleReset() {
    setResults([]);
  }

  const totalTime = calculateTotalTime(results);
  const previousTotalTime = comparisonSnapshot?.totalTime ?? null;
  const totalDelta =
    totalTime !== null && previousTotalTime !== null
      ? roundScore(totalTime - previousTotalTime)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="editorial-kicker">Performance Lab</p>
        <div className="editorial-rule mx-auto my-3" />
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
          <Zap className="h-4 w-4" />
          Performance Benchmark
        </div>
        <h1 className="font-display mb-2 text-4xl font-semibold tracking-tight text-primary-dark sm:text-5xl">
          Browser Performance Benchmark
        </h1>
        <p className="text-muted">
          Measure how your browser performs across DOM, math, array processing, Canvas, and graphics
          workloads
        </p>
        <p className="mt-3 text-xs text-muted">
          Each benchmark runs {BENCHMARK_RUNS} times and reports the average result. Lower times are
          better.
        </p>
      </div>

      <div className="paper-panel mb-8 grid gap-4 rounded-2xl p-5 sm:grid-cols-2 xl:grid-cols-3 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Viewport
          </p>
          <p className="mt-1 text-base font-semibold text-primary dark:text-white">
            {environment.viewport}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Pixel Ratio
          </p>
          <p className="mt-1 text-base font-semibold text-primary dark:text-white">
            {environment.pixelRatio}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Logical Cores
          </p>
          <p className="mt-1 text-base font-semibold text-primary dark:text-white">
            {environment.logicalCores}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Device Memory
          </p>
          <p className="mt-1 text-base font-semibold text-primary dark:text-white">
            {environment.deviceMemory}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Language
          </p>
          <p className="mt-1 text-base font-semibold text-primary dark:text-white">
            {environment.language}
          </p>
        </div>
        <div className="sm:col-span-2 xl:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            User Agent
          </p>
          <p className="mt-1 break-all text-sm text-muted">{environment.userAgent}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={runAll}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Benchmark
            </>
          )}
        </button>
        {results.length > 0 && !running && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
        {previousSnapshot && !running && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/8 dark:border-danger/40"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        )}
        {results.length > 0 && !running && (
          <>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              Markdown
            </button>
          </>
        )}
      </div>

      {/* Total score */}
      {totalTime !== null && !running && (
        <div className="paper-panel mb-8 rounded-2xl p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-muted">Total Time</p>
          <p className="mt-1 text-4xl font-bold text-primary dark:text-white">
            {totalTime} <span className="text-lg text-muted">ms</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Lower time generally indicates better performance
          </p>
          <p className="mt-2 text-[11px] text-muted">
            Synthetic results are useful for relative comparison, not absolute device rankings.
          </p>
          {comparisonSnapshot && totalDelta !== null && (
            <p className={`mt-2 text-xs font-medium ${deltaTone(totalDelta)}`}>
              {deltaLabel(totalDelta, 'ms')}
            </p>
          )}
        </div>
      )}

      {comparisonSnapshot && results.length > 0 && !running && (
        <div className="paper-panel mb-8 rounded-2xl p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Comparison Baseline
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-white">
            Previous run saved at {formatTimestamp(comparisonSnapshot.timestamp)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Compare current results against the most recent completed benchmark stored locally in
            this browser.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r) => {
            const previousResult = comparisonSnapshot?.results.find((item) => item.name === r.name);
            const delta = getResultDelta(r, previousResult);

            return (
              <div
                key={r.name}
                className="paper-panel rounded-2xl p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-xs text-muted">{r.description}</p>
                    {r.samples && r.samples.length > 0 && (
                      <p className="mt-2 text-[11px] text-muted">
                        Avg {r.score} ms · Best {r.bestScore} ms · Runs {r.runs}
                      </p>
                    )}
                    {delta !== null && (
                      <p className={`mt-1 text-[11px] font-medium ${deltaTone(delta)}`}>
                        {deltaLabel(delta, r.unit)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{r.score < 0 ? 'N/A' : r.score}</span>
                    {r.score >= 0 && <span className="ml-1 text-sm text-muted">{r.unit}</span>}
                    <p className="text-xs text-muted">{scoreLabel(r.score, r.unit)}</p>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreColor(r.score, r.unit)}`}
                    style={{ width: barWidth(r.score, r.unit) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !running && (
        <div className="paper-panel rounded-2xl border-dashed p-12 text-center dark:border-gray-700 dark:bg-gray-900/60">
          <Zap className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-muted">Click “Start Benchmark” to run the browser performance tests</p>
        </div>
      )}
    </div>
  );
}
