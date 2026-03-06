import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-2 text-6xl font-bold text-accent">404</h1>
      <p className="mb-6 text-lg text-muted">Page not found</p>
      <Link
        to="/"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Go Home
      </Link>
    </div>
  );
}
