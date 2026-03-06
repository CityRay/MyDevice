import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 noise-overlay"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-12 -z-10 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
      />
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
