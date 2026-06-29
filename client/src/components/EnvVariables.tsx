import { useState } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff, GitBranch, Layers, Settings } from 'lucide-react';
import { addEnvVariable, deleteEnvVariable, updateProject } from '../api';
import { IProject, IEnvVariable } from '../types';

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

function EnvRow({
  v,
  projectId,
  onDelete,
  showScope,
}: {
  v: IEnvVariable;
  projectId: string;
  onDelete: () => void;
  showScope: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2.5 group">
      <span className="font-mono text-sm text-brand-400 flex-1 truncate">{v.key}</span>
      <span className="font-mono text-sm text-slate-400 flex-1 truncate">
        {show ? v.value : '•'.repeat(Math.min(v.value.length, 16))}
      </span>
      {showScope && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
            v.scope === 'client'
              ? 'bg-violet-500/15 text-violet-400'
              : v.scope === 'server'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {v.scope}
        </span>
      )}
      <button
        onClick={() => setShow(s => !s)}
        className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        onClick={async () => {
          if (!window.confirm('Delete this variable?')) return;
          const u = await deleteEnvVariable(projectId, v._id);
          onDelete();
        }}
        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function EnvSection({
  title,
  color,
  variables,
  projectId,
  onDelete,
  showScope,
}: {
  title: string;
  color: string;
  variables: IEnvVariable[];
  projectId: string;
  onDelete: (id: string) => void;
  showScope: boolean;
}) {
  if (variables.length === 0) return null;
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>{title}</div>
      <div className="space-y-1.5">
        {variables.map(v => (
          <EnvRow
            key={v._id}
            v={v}
            projectId={projectId}
            onDelete={() => onDelete(v._id)}
            showScope={showScope}
          />
        ))}
      </div>
    </div>
  );
}

type Scope = 'all' | 'client' | 'server';

export default function EnvVariables({ project, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [loading, setLoading] = useState(false);
  const [changingType, setChangingType] = useState(false);
  // Local state so UI never flashes back waiting on API
  const [repoType, setRepoTypeLocal] = useState<'single' | 'multi' | undefined>(project.repoType);

  const isMulti = repoType === 'multi';
  const isSingle = repoType === 'single';
  const repoSet = isSingle || isMulti;

  const handleSetRepoType = async (type: 'single' | 'multi') => {
    setRepoTypeLocal(type);
    setChangingType(false);
    setScope(type === 'single' ? 'all' : 'client');
    try {
      const updated = await updateProject(project._id, { repoType: type });
      onUpdate(updated);
    } catch {
      console.error('Failed to save repo type');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    setLoading(true);
    try {
      const updated = await addEnvVariable(project._id, {
        key: key.trim(),
        value: value.trim(),
        scope: isSingle ? 'all' : scope,
      });
      onUpdate(updated);
      setKey('');
      setValue('');
      setAdding(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (varId: string) => {
    const updated = await deleteEnvVariable(project._id, varId);
    onUpdate(updated);
  };

  const clientVars = project.envVariables.filter(v => v.scope === 'client');
  const serverVars = project.envVariables.filter(v => v.scope === 'server');
  const allVars = project.envVariables.filter(v => v.scope === 'all');

  // ── Repo type selection screen ───────────────────────────────────────
  if (!repoSet || changingType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-500" />
            Environment Variables
          </h3>
          {changingType && (
            <button onClick={() => setChangingType(false)} className="text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
          )}
        </div>
        <p className="text-slate-400 text-sm">How is this project structured?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSetRepoType('single')}
            className="card hover:border-brand-500/60 transition-colors text-left group"
          >
            <Layers className="w-7 h-7 text-brand-500 mb-3" />
            <div className="font-semibold text-white mb-1">Single Repository</div>
            <div className="text-xs text-slate-400">
              Client and server live in the same repo. All env variables are shown together.
            </div>
          </button>
          <button
            onClick={() => handleSetRepoType('multi')}
            className="card hover:border-brand-500/60 transition-colors text-left group"
          >
            <GitBranch className="w-7 h-7 text-violet-400 mb-3" />
            <div className="font-semibold text-white mb-1">Separate Repos</div>
            <div className="text-xs text-slate-400">
              Client and server are in different repos. Variables are grouped by where they belong.
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-500" />
          Environment Variables
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-1 ${isMulti ? 'bg-violet-500/15 text-violet-400' : 'bg-slate-700 text-slate-400'}`}>
            {isMulti ? 'Separate repos' : 'Single repo'}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChangingType(true)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Change repo structure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAdding(true); if (isMulti) setScope('client'); }}
            className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
          >
            <Plus className="w-4 h-4" /> Add Variable
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card space-y-3 border-brand-500/30">
          {isMulti && (
            <div>
              <label className="label">Scope</label>
              <div className="flex gap-2">
                {(['client', 'server'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      scope === s
                        ? s === 'client'
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {s === 'client' ? 'Client' : 'Server'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Key</label>
              <input
                className="input font-mono text-sm"
                placeholder="DATABASE_URL"
                value={key}
                onChange={e => setKey(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Value</label>
              <input
                className="input font-mono text-sm"
                placeholder="value"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setKey(''); setValue(''); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={!key.trim() || !value.trim() || loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Add Variable'}
            </button>
          </div>
        </form>
      )}

      {project.envVariables.length === 0 && !adding ? (
        <p className="text-slate-500 text-sm text-center py-6">No environment variables added yet.</p>
      ) : isSingle ? (
        // Single repo — flat list
        <div className="space-y-1.5">
          {project.envVariables.map(v => (
            <EnvRow key={v._id} v={v} projectId={project._id} onDelete={() => handleDelete(v._id)} showScope={false} />
          ))}
        </div>
      ) : (
        // Multi repo — grouped sections
        <div className="space-y-5">
          <EnvSection
            title="Client"
            color="text-violet-400"
            variables={clientVars}
            projectId={project._id}
            onDelete={handleDelete}
            showScope={false}
          />
          <EnvSection
            title="Server"
            color="text-emerald-400"
            variables={serverVars}
            projectId={project._id}
            onDelete={handleDelete}
            showScope={false}
          />
          {allVars.length > 0 && (
            <EnvSection
              title="Shared"
              color="text-slate-400"
              variables={allVars}
              projectId={project._id}
              onDelete={handleDelete}
              showScope={false}
            />
          )}
          {clientVars.length === 0 && serverVars.length === 0 && allVars.length === 0 && !adding && (
            <p className="text-slate-500 text-sm text-center py-4">No environment variables added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
