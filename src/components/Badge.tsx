import type { FeatureStatus } from '@/types';

interface BadgeProps {
  status: FeatureStatus | boolean;
  labelSupported?: string;
  labelUnsupported?: string;
}

export default function Badge({
  status,
  labelSupported = 'Supported',
  labelUnsupported = 'Not supported'
}: BadgeProps) {
  const isSupported = status === true || status === 'supported';
  const isUnknown = status === 'unknown';

  if (isUnknown) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isSupported ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      }`}
    >
      {isSupported ? labelSupported : labelUnsupported}
    </span>
  );
}
