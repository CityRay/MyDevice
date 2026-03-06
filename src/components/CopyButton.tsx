import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { copyToClipboard } from '@/utils/clipboard';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
      showToast('success', 'Copied to clipboard.');
    } else {
      showToast('error', 'Copy failed. Please try again.');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}
