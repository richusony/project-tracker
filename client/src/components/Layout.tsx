import { Outlet, Link } from 'react-router-dom';
import { FolderKanban, Archive } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FolderKanban className="w-6 h-6 text-brand-500" />
            <span className="font-bold text-lg text-white">Project Tracker</span>
          </Link>
          <Link to="/archives" className="ml-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <Archive className="w-4 h-4" /> Archives
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
