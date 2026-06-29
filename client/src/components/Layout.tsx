import { Outlet, Link, useLocation } from 'react-router-dom';
import { FolderKanban, Archive, LayoutGrid } from 'lucide-react';
import { ThemeToggle } from './ThemeProvider';

const NAV = [
  { to: '/',         label: 'Projects', icon: LayoutGrid, exact: true },
  { to: '/archives', label: 'Archives', icon: Archive,    exact: false },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-stroke bg-canvas/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-xs group-hover:shadow-glow transition-shadow duration-300">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-ink hidden sm:block tracking-tight">
              Project Tracker
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block h-5 w-px bg-stroke" />

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-surface border border-stroke text-ink shadow-xs'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
