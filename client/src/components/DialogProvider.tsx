import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Link as LinkIcon, Youtube as YoutubeIcon } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type PromptOptions = {
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  icon?: 'link' | 'youtube';
};

type DialogContextType = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside DialogProvider');
  return ctx;
}

type ConfirmState = { opts: ConfirmOptions; resolve: (v: boolean) => void } | null;
type PromptState = { opts: PromptOptions; resolve: (v: string | null) => void } | null;

function ConfirmDialog({ state, onResolve }: { state: ConfirmState; onResolve: (v: boolean) => void }) {
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResolve(false);
      if (e.key === 'Enter') onResolve(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, onResolve]);

  if (!state) return null;

  const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger' } = state.opts;
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => onResolve(false)}>
      <div className="card w-full max-w-sm shadow-2xl border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-5">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
            {isDanger
              ? <Trash2 className="w-5 h-5 text-red-400" />
              : <AlertTriangle className="w-5 h-5 text-amber-400" />
            }
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="font-semibold text-white text-base leading-tight">{title}</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => onResolve(false)}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => onResolve(false)} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            onClick={() => onResolve(true)}
            autoFocus
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptDialog({ state, onResolve }: { state: PromptState; onResolve: (v: string | null) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state) {
      setValue(state.opts.defaultValue ?? '');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResolve(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, onResolve]);

  if (!state) return null;

  const { title, label, placeholder, icon } = state.opts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onResolve(value.trim());
  };

  const Icon = icon === 'youtube' ? YoutubeIcon : LinkIcon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => onResolve(null)}>
      <div className="card w-full max-w-sm shadow-2xl border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-brand-400" />
          </div>
          <h3 className="font-semibold text-white text-base">{title}</h3>
          <button
            onClick={() => onResolve(null)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {label && <label className="label">{label}</label>}
            <input
              ref={inputRef}
              className="input"
              placeholder={placeholder}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={() => onResolve(null)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!value.trim()} className="btn-primary flex-1">
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [promptState, setPromptState] = useState<PromptState>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ opts, resolve });
    });
  }, []);

  const prompt = useCallback((opts: PromptOptions): Promise<string | null> => {
    return new Promise(resolve => {
      setPromptState({ opts, resolve });
    });
  }, []);

  const handleConfirmResolve = useCallback((v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  }, [confirmState]);

  const handlePromptResolve = useCallback((v: string | null) => {
    promptState?.resolve(v);
    setPromptState(null);
  }, [promptState]);

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      <ConfirmDialog state={confirmState} onResolve={handleConfirmResolve} />
      <PromptDialog state={promptState} onResolve={handlePromptResolve} />
    </DialogContext.Provider>
  );
}
