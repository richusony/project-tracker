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
type PromptState  = { opts: PromptOptions;  resolve: (v: string | null) => void } | null;

/* ── Confirm Dialog ───────────────────────────────────────────── */
function ConfirmDialog({ state, onResolve }: { state: ConfirmState; onResolve: (v: boolean) => void }) {
  useEffect(() => {
    if (!state) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResolve(false);
      if (e.key === 'Enter')  onResolve(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [state, onResolve]);

  if (!state) return null;

  const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger' } = state.opts;
  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-canvas/70 backdrop-blur-md animate-fade-in"
      onClick={() => onResolve(false)}
    >
      <div
        className="card w-full max-w-sm shadow-modal animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              {isDanger
                ? <Trash2 className="w-4 h-4 text-red-500" />
                : <AlertTriangle className="w-4 h-4 text-amber-500" />
              }
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="font-bold text-ink text-base leading-tight">{title}</h3>
              <p className="text-sm text-ink-2 mt-1 leading-relaxed">{message}</p>
            </div>
            <button onClick={() => onResolve(false)} className="btn-ghost p-1.5 rounded-lg text-ink-3 flex-shrink-0 -mt-1 -mr-1">
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
              className={`flex-1 btn ${isDanger
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-white'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Prompt Dialog ────────────────────────────────────────────── */
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
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onResolve(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [state, onResolve]);

  if (!state) return null;

  const { title, label, placeholder, icon } = state.opts;
  const Icon = icon === 'youtube' ? YoutubeIcon : LinkIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-canvas/70 backdrop-blur-md animate-fade-in"
      onClick={() => onResolve(null)}
    >
      <div
        className="card w-full max-w-sm shadow-modal animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-brand-500" />
            </div>
            <h3 className="font-bold text-ink text-base flex-1">{title}</h3>
            <button onClick={() => onResolve(null)} className="btn-ghost p-1.5 rounded-lg text-ink-3">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={e => { e.preventDefault(); if (value.trim()) onResolve(value.trim()); }}
            className="space-y-4"
          >
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
    </div>
  );
}

/* ── Provider ─────────────────────────────────────────────────── */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [promptState,  setPromptState]  = useState<PromptState>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> =>
    new Promise(resolve => setConfirmState({ opts, resolve })), []);

  const prompt = useCallback((opts: PromptOptions): Promise<string | null> =>
    new Promise(resolve => setPromptState({ opts, resolve })), []);

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
      <PromptDialog  state={promptState}  onResolve={handlePromptResolve} />
    </DialogContext.Provider>
  );
}
