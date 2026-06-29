import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

type ThemeCtx = {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<ThemeCtx>({ theme: 'system', resolved: 'dark', setTheme: () => {} });

export function useTheme() { return useContext(Ctx); }

function getResolved(t: Theme): 'light' | 'dark' {
  if (t !== 'system') return t;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) ?? 'system'
  );
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => getResolved(theme));

  const apply = useCallback((t: Theme) => {
    const r = getResolved(t);
    document.documentElement.classList.toggle('dark', r === 'dark');
    setResolved(r);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem('theme', t);
    setThemeState(t);
    apply(t);
  }, [apply]);

  useEffect(() => {
    apply(theme);
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => apply('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, apply]);

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light',  label: 'Light',  icon: <Sun className="w-4 h-4" /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

export function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = theme === 'system'
    ? OPTIONS[2]
    : resolved === 'dark' ? OPTIONS[1] : OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-ghost p-2 rounded-xl"
        title={`Theme: ${current.label}`}
        aria-label="Toggle theme"
      >
        {current.icon}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 card shadow-lg py-1 min-w-[140px] z-[200] animate-scale-in">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors rounded-lg mx-1 ${
                theme === opt.value
                  ? 'text-brand-500 font-semibold'
                  : 'text-ink-2 hover:text-ink hover:bg-surface-2'
              }`}
            >
              {opt.icon}
              {opt.label}
              {theme === opt.value && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
