import { useState, useRef, useEffect, useId } from 'react';
import { Download, Share2, FileJson, FileText, Copy, Check, Camera } from 'lucide-react';
import { Stat } from '@/components/InfoDisplay';
import CopyButton from '@/components/CopyButton';
import ViewportCard from '@/components/cards/ViewportCard';
import ScreenCard from '@/components/cards/ScreenCard';
import PixelCard from '@/components/cards/PixelCard';
import OrientationCard from '@/components/cards/OrientationCard';
import FeatureSummaryCard from '@/components/cards/FeatureSummaryCard';
import MediaQueryCard from '@/components/cards/MediaQueryCard';
import { useToast } from '@/hooks/useToast';
import { useScreenInfo } from '@/hooks/useScreenInfo';
import { useMediaQueries } from '@/hooks/useMediaQueries';
import { useFeatureDetection } from '@/hooks/useFeatureDetection';
import { copyToClipboard } from '@/utils/clipboard';
import {
  buildCopyText,
  buildJsonExport,
  buildMarkdownExport,
  downloadFile,
  captureScreenshot
} from '@/utils/export';

/* ── Export dropdown ── */

function ExportMenu({
  onCopy,
  onJson,
  onMarkdown,
  onScreenshot,
  onShare
}: {
  onCopy: () => Promise<boolean>;
  onJson: () => void;
  onMarkdown: () => void;
  onScreenshot: () => void;
  onShare: (() => void) | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const visibleItems = 4 + (onShare ? 1 : 0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    // Keep keyboard focus within the export menu while it's open.
    itemRefs.current[0]?.focus();

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }

      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

      const active = document.activeElement as HTMLElement | null;
      const idx = itemRefs.current.findIndex((el) => el === active);
      if (idx === -1) return;

      e.preventDefault();

      if (e.key === 'ArrowDown') {
        itemRefs.current[(idx + 1) % visibleItems]?.focus();
      } else if (e.key === 'ArrowUp') {
        itemRefs.current[(idx - 1 + visibleItems) % visibleItems]?.focus();
      } else if (e.key === 'Home') {
        itemRefs.current[0]?.focus();
      } else if (e.key === 'End') {
        itemRefs.current[visibleItems - 1]?.focus();
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, visibleItems]);

  useEffect(() => {
    if (!open) itemRefs.current = [];
  }, [open]);

  async function handleCopy() {
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (open) return;
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Export options"
          className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <button
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            onClick={handleCopy}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy as text'}
          </button>
          <button
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            onClick={() => {
              onJson();
              setOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FileJson className="h-4 w-4" />
            Download JSON
          </button>
          <button
            ref={(el) => {
              itemRefs.current[2] = el;
            }}
            onClick={() => {
              onMarkdown();
              setOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FileText className="h-4 w-4" />
            Download Markdown
          </button>
          <button
            ref={(el) => {
              itemRefs.current[3] = el;
            }}
            onClick={() => {
              onScreenshot();
              setOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Camera className="h-4 w-4" />
            Save as Image
          </button>
          {onShare && (
            <button
              ref={(el) => {
                itemRefs.current[4] = el;
              }}
              onClick={() => {
                onShare();
                setOpen(false);
              }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Share2 className="h-4 w-4" />
              Share...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page component ── */

export default function Home() {
  const info = useScreenInfo();
  const features = useFeatureDetection();
  const mediaQueries = useMediaQueries();
  const reportRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const canShare = typeof navigator.share === 'function';

  async function handleCopy(): Promise<boolean> {
    const ok = await copyToClipboard(buildCopyText(info));
    showToast(ok ? 'success' : 'error', ok ? 'Summary copied to clipboard.' : 'Copy failed.');
    return ok;
  }

  function handleJsonExport() {
    downloadFile(
      buildJsonExport(info, features, mediaQueries),
      `mydevice-report-${Date.now()}.json`,
      'application/json'
    );
    showToast('success', 'JSON report downloaded.');
  }

  function handleMarkdownExport() {
    downloadFile(
      buildMarkdownExport(info, features, mediaQueries),
      `mydevice-report-${Date.now()}.md`,
      'text/markdown'
    );
    showToast('success', 'Markdown report downloaded.');
  }

  function handleShare() {
    void navigator
      .share({
        title: 'MyDevice Detection Report',
        text: buildCopyText(info)
      })
      .then(() => {
        showToast('success', 'Share sheet opened.');
      })
      .catch(() => {
        showToast('error', 'Share was cancelled or unavailable.');
      });
  }

  function handleScreenshot() {
    if (reportRef.current) {
      void captureScreenshot(reportRef.current)
        .then(() => {
          showToast('success', 'Screenshot saved as PNG.');
        })
        .catch((err) => {
          console.error('Save as Image failed:', err);
          showToast('error', 'Save as Image failed. Please try Download JSON/Markdown.');
        });
    }
  }

  return (
    <div ref={reportRef} className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
        <div className="animate-fade-up">
          <p className="editorial-kicker">Browser Observatory</p>
          <div className="editorial-rule my-3" />
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-primary-dark sm:text-5xl">
            Know Your Device,
            <br />
            <span className="text-accent">Frame by Frame</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
            Real-time viewport, rendering, and capability signals for front-end diagnostics.
          </p>
        </div>

        <div className="paper-panel animate-fade-up-delay rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Session Snapshot
          </p>
          <p className="mt-2 font-mono text-xs text-muted">DPR {info.devicePixelRatio}x</p>
          <p className="font-mono text-xs text-muted">
            {info.viewportWidth}x{info.viewportHeight}px
          </p>
          <p className="mt-3 text-xs text-muted">
            Live values update on resize and orientation changes.
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="paper-panel mb-8 grid grid-cols-2 gap-4 rounded-2xl p-6 sm:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <Stat label="Viewport Width" value={info.viewportWidth} unit="px" accent />
        <Stat label="Viewport Height" value={info.viewportHeight} unit="px" accent />
        <Stat label="Pixel Ratio" value={info.devicePixelRatio} unit="×" />
        <Stat label="Screen" value={`${info.screenWidth}×${info.screenHeight}`} unit="px" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Export a concise report for QA docs, bug tickets, or cross-device audits.
        </p>
        <ExportMenu
          onCopy={handleCopy}
          onJson={handleJsonExport}
          onMarkdown={handleMarkdownExport}
          onScreenshot={handleScreenshot}
          onShare={canShare ? handleShare : null}
        />
      </div>

      {/* Detail cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ViewportCard info={info} />
        <ScreenCard info={info} />
        <PixelCard info={info} />
        <OrientationCard info={info} />
        <FeatureSummaryCard features={features} />
        <MediaQueryCard mediaQueries={mediaQueries} />
      </div>

      {/* User Agent */}
      <div className="paper-panel mt-6 rounded-2xl p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">User Agent</h2>
          <CopyButton
            text={info.userAgent}
            className="border border-black/10 bg-white/60 px-2.5 py-1"
          />
        </div>
        <p className="break-all font-mono text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {info.userAgent}
        </p>
      </div>
    </div>
  );
}
