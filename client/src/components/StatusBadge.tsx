import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { IProject } from '../types';

export type Status = IProject['status'];

export const STATUS_CONFIG: Record<Status, { label: string; dot: string; badge: string }> = {
  planning:  { label: 'Planning',         dot: 'bg-brand-500',   badge: 'bg-brand-500/10 text-brand-500 border-brand-500/20' },
  ongoing:   { label: 'Ongoing',          dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'on-hold': { label: 'On Hold',          dot: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed',        dot: 'bg-violet-500',  badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  abandoned: { label: 'No Longer Needed', dot: 'bg-ink-3',       badge: 'bg-surface-2 text-ink-3 border-stroke' },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ongoing;
  return (
    <span className={`badge border ${cfg.badge} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

interface StatusPickerProps {
  status: Status;
  onChange: (s: Status) => void;
}

export function StatusPicker({ status, onChange }: StatusPickerProps) {
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

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ongoing;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`badge border gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${cfg.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 card shadow-lg py-1 min-w-[170px] z-50 animate-scale-in">
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-2 rounded-lg mx-1"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${val.dot}`} />
              <span className={`flex-1 text-left ${key === status ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                {val.label}
              </span>
              {key === status && <Check className="w-3.5 h-3.5 text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
