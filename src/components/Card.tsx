import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export default function Card({ title, icon, children, className = '', headerAction }: CardProps) {
  return (
    <section
      className={`paper-panel rounded-2xl p-5 ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {icon}
          {title}
        </h2>
        {headerAction}
      </div>
      {children}
    </section>
  );
}
