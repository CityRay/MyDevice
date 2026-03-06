import { NavLink } from 'react-router-dom';
import { Smartphone, Monitor, Cpu, Zap, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { to: '/', label: 'My Device', icon: Smartphone, end: true },
  { to: '/devices', label: 'Devices', icon: Monitor, end: false },
  { to: '/features', label: 'Features', icon: Cpu, end: false },
  { to: '/benchmark', label: 'Benchmark', icon: Zap, end: false }
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f3ea]/88 backdrop-blur dark:border-gray-800 dark:bg-surface-dark/85">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <NavLink to="/" className="group flex items-center gap-2 text-primary-dark dark:text-white">
          <Smartphone className="h-5 w-5 text-accent transition-transform group-hover:-translate-y-0.5" />
          <span className="font-display text-[1.1rem] font-semibold tracking-tight">MyDevice</span>
        </NavLink>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className="absolute bottom-1 left-3 h-px w-0 bg-accent transition-all duration-200 group-hover:w-8"
                  aria-hidden="true"
                />
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-black/10 p-2 text-gray-600 hover:bg-black/5 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile nav */}
      <div
        ref={mobileRef}
        className={`overflow-hidden border-t border-gray-200 transition-[max-height] duration-300 ease-in-out md:hidden dark:border-gray-800 ${
          open ? 'max-h-60' : 'max-h-0 border-t-0'
        }`}
      >
        <ul className="px-4 pb-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-700 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
