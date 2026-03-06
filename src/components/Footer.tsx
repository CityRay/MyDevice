import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-surface-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>MyDevice &mdash; A tool for front-end developers &amp; RWD designers</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/CityRay/mydevice"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
