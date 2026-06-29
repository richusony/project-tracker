import { useState } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff, GitBranch, Layers, Settings, ClipboardPaste, Copy, Check } from 'lucide-react';
import { addEnvVariable, deleteEnvVariable, updateProject } from '../api';
import { IProject, IEnvVariable } from '../types';
import { useDialog } from './DialogProvider';

function parseDotEnv(raw: string): { key: string; value: string }[] {
  const results: { key: string; value: string }[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (!key) continue;
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else {
      const commentIdx = val.indexOf(' #');
      if (commentIdx !== -1) val = val.slice(0, commentIdx).trim();
    }
    results.push({ key, value: val });
  }
  return results;
}

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

function EnvRow({ v, projectId, onDelete, showScope }: {
  v: IEnvVariable; projectId: string; onDelete: () => void; showScope: boolean;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const { confirm } = useDialog();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(v.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 bg-surface-2 rounded-xl px-4 py-2.5 group">
      <span className="font-mono text-sm text-brand-500 font-medium w-2/5 truncate flex-shrink-0">{v.key}</span>
      <span className="font-mono text-sm text-ink-2 flex-1 truncate">
        {show ? v.value : '•'.repeat(Math.min(v.value.length, 20))}
      </span>
      {showScope && (
        <span className={`badge flex-shrink-0 ${
          v.scope === 'client' ? 'bg-violet-500/10 text-violet-500' :
          v.scope === 'server' ? 'bg-emerald-500/10 text-emerald-500' :
          'badge-slate'
        }`}>
          {v.scope}
        </span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleCopy} className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-ink-2">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setShow(s => !s)} className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-ink-2">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={async () => {
            const ok = await confirm({
              title: 'Delete Variable',
              message: `Delete "${v.key}"? This cannot be undone.`,
              confirmLabel: 'Delete',
              variant: 'danger',
            });
            if (!ok) return;
            await deleteEnvVariable(projectId, v._id);
            onDelete();
          }}
          className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EnvSection({ title, color, variables, projectId, onDelete, showScope }: {
  title: string; color: string; variables: IEnvVariable[];
  projectId: string; onDelete: (id: string) => void; showScope: boolean;
}) {
  if (variables.length === 0) return null;
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>{title}</p>
      <div className="space-y-1.5">
        {variables.map(v => (
          <EnvRow key={v._id} v={v} projectId={projectId} onDelete={() => onDelete(v._id)} showScope={showScope} />
        ))}
      </div>
    </div>
  );
}

type Scope = 'all' | 'client' | 'server';

export default function EnvVariables({ project, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'paste'>('single');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [loading, setLoading] = useState(false);
  const [changingType, setChangingType] = useState(false);
  const [repoType, setRepoTypeLocal] = useState<'single' | 'multi' | undefined>(project.repoType);

  const isMulti = repoType === 'multi';
  const isSingle = repoType === 'single';
  const repoSet = isSingle || isMulti;

  const handleSetRepoType = async (type: 'single' | 'multi') => {
    setRepoTypeLocal(type);
    setChangingType(false);
    setScope(type === 'single' ? 'all' : 'client');
    try { const updated = await updateProject(project._id, { repoType: type }); onUpdate(updated); }
    catch { /* silent */ }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    setLoading(true);
    try {
      const updated = await addEnvVariable(project._id, { key: key.trim(), value: value.trim(), scope: isSingle ? 'all' : scope });
      onUpdate(updated); setKey(''); setValue(''); setAdding(false);
    } finally { setLoading(false); }
  };

  const handlePasteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const pairs = parseDotEnv(pasteText);
    if (pairs.length === 0) return;
    setLoading(true);
    try {
      let updated = project;
      for (const pair of pairs) {
        updated = await addEnvVariable(project._id, { key: pair.key, value: pair.value, scope: isSingle ? 'all' : scope });
      }
      onUpdate(updated); setPasteText(''); setAdding(false);
    } finally { setLoading(false); }
  };

  const closeAdding = () => { setAdding(false); setKey(''); setValue(''); setPasteText(''); setAddMode('single'); };
  const handleDelete = async (varId: string) => { const updated = await deleteEnvVariable(project._id, varId); onUpdate(updated); };

  const clientVars = project.envVariables.filter(v => v.scope === 'client');
  const serverVars = project.envVariables.filter(v => v.scope === 'server');
  const allVars    = project.envVariables.filter(v => v.scope === 'all');

  /* ── Repo type selection ── */
  if (!repoSet || changingType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="section-title">
            <KeyRound className="w-4 h-4 text-brand-500" /> Environment Variables
          </div>
          {changingType && (
            <button onClick={() => setChangingType(false)} className="btn-ghost text-sm">Cancel</button>
          )}
        </div>
        <p className="text-sm text-ink-2">How is this project structured?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'single' as const, icon: <Layers className="w-6 h-6 text-brand-500 mb-2" />, title: 'Single Repo', desc: 'Client and server share one repo. All vars shown together.' },
            { type: 'multi'  as const, icon: <GitBranch className="w-6 h-6 text-violet-500 mb-2" />, title: 'Separate Repos', desc: 'Client and server in different repos. Vars grouped by scope.' },
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => handleSetRepoType(opt.type)}
              className="card-p hover:border-brand-500/40 text-left transition-all duration-200 group"
            >
              {opt.icon}
              <p className="font-semibold text-sm text-ink mb-1 group-hover:text-brand-500 transition-colors">{opt.title}</p>
              <p className="text-xs text-ink-2 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="section-title">
          <KeyRound className="w-4 h-4 text-brand-500" />
          Environment Variables
          <span className={`badge ${isMulti ? 'bg-violet-500/10 text-violet-500' : 'badge-slate'} ml-1`}>
            {isMulti ? 'Separate repos' : 'Single repo'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setChangingType(true)} className="btn-ghost p-2 rounded-xl text-ink-3 hover:text-ink-2" title="Change repo structure">
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAdding(true); setAddMode('paste'); if (isMulti) setScope('client'); }}
            className="btn-secondary gap-1.5 text-sm py-1.5"
            title="Paste .env"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAdding(true); setAddMode('single'); if (isMulti) setScope('client'); }}
            className="btn-primary gap-1.5 text-sm py-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card-p space-y-3 border-brand-500/30 animate-slide-up">
          {/* Mode tabs */}
          <div className="tab-bar">
            <button type="button" onClick={() => setAddMode('single')} className={addMode === 'single' ? 'tab-active' : 'tab-inactive'}>
              <Plus className="w-3.5 h-3.5" /> Single
            </button>
            <button type="button" onClick={() => setAddMode('paste')} className={addMode === 'paste' ? 'tab-active' : 'tab-inactive'}>
              <ClipboardPaste className="w-3.5 h-3.5" /> Paste .env
            </button>
          </div>

          {/* Scope selector */}
          {isMulti && (
            <div>
              <label className="label">Scope</label>
              <div className="flex gap-2">
                {(['client', 'server'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      scope === s
                        ? s === 'client'
                          ? 'bg-violet-500/10 border-violet-500/30 text-violet-500'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : 'border-stroke text-ink-2 hover:border-stroke-2 hover:text-ink'
                    }`}
                  >
                    {s === 'client' ? 'Client' : 'Server'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {addMode === 'single' ? (
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Key</label>
                  <input className="input font-mono text-sm" placeholder="DATABASE_URL" value={key} onChange={e => setKey(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="label">Value</label>
                  <input className="input font-mono text-sm" placeholder="value" value={value} onChange={e => setValue(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeAdding} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={!key.trim() || !value.trim() || loading} className="btn-primary flex-1">
                  {loading ? 'Saving…' : 'Add Variable'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasteImport} className="space-y-3">
              <div>
                <label className="label">Paste .env content</label>
                <textarea
                  className="input font-mono text-sm resize-none"
                  rows={8}
                  placeholder={'DATABASE_URL=postgres://...\nNEXT_PUBLIC_API_URL=https://...\n# comments are ignored'}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  autoFocus
                />
                {pasteText.trim() && (() => {
                  const count = parseDotEnv(pasteText).length;
                  return (
                    <p className="text-xs text-ink-3 mt-1">
                      {count === 0 ? 'No valid variables detected.' : `${count} variable${count !== 1 ? 's' : ''} detected`}
                    </p>
                  );
                })()}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeAdding} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={parseDotEnv(pasteText).length === 0 || loading} className="btn-primary flex-1">
                  {loading ? 'Importing…' : `Import ${parseDotEnv(pasteText).length > 0 ? parseDotEnv(pasteText).length : ''} Var${parseDotEnv(pasteText).length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Variables */}
      {project.envVariables.length === 0 && !adding ? (
        <div className="card-p text-center py-8">
          <KeyRound className="w-10 h-10 text-ink-3 mx-auto mb-3" />
          <p className="text-sm text-ink-2">No environment variables added yet.</p>
        </div>
      ) : isSingle ? (
        <div className="space-y-1.5">
          {project.envVariables.map(v => (
            <EnvRow key={v._id} v={v} projectId={project._id} onDelete={() => handleDelete(v._id)} showScope={false} />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <EnvSection title="Client" color="text-violet-500" variables={clientVars} projectId={project._id} onDelete={handleDelete} showScope={false} />
          <EnvSection title="Server" color="text-emerald-500" variables={serverVars} projectId={project._id} onDelete={handleDelete} showScope={false} />
          {allVars.length > 0 && (
            <EnvSection title="Shared" color="text-ink-2" variables={allVars} projectId={project._id} onDelete={handleDelete} showScope={false} />
          )}
          {clientVars.length === 0 && serverVars.length === 0 && allVars.length === 0 && !adding && (
            <p className="text-sm text-ink-3 text-center py-4">No environment variables added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
