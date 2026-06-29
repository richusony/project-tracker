import { useState } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { addEnvVariable, deleteEnvVariable } from '../api';
import { IProject, IEnvVariable } from '../types';

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

function EnvRow({ v, projectId, onDelete }: { v: IEnvVariable; projectId: string; onDelete: () => void }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2.5">
      <span className="font-mono text-sm text-brand-400 flex-1 truncate">{v.key}</span>
      <span className="font-mono text-sm text-slate-400 flex-1 truncate">
        {show ? v.value : '•'.repeat(Math.min(v.value.length, 16))}
      </span>
      <button onClick={() => setShow(s => !s)} className="text-slate-500 hover:text-slate-300 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        onClick={async () => { if (window.confirm('Delete this variable?')) { const u = await deleteEnvVariable(projectId, v._id); onDelete(); } }}
        className="text-slate-500 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function EnvVariables({ project, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    setLoading(true);
    try {
      const updated = await addEnvVariable(project._id, { key: key.trim(), value: value.trim() });
      onUpdate(updated);
      setKey('');
      setValue('');
      setAdding(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-500" />
          Environment Variables
        </h3>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
          <Plus className="w-4 h-4" /> Add Variable
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card space-y-3 border-brand-500/30">
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
            <button type="button" onClick={() => { setAdding(false); setKey(''); setValue(''); }} className="btn-secondary flex-1">
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
      ) : (
        <div className="space-y-2">
          {project.envVariables.map(v => (
            <EnvRow
              key={v._id}
              v={v}
              projectId={project._id}
              onDelete={async () => {
                const updated = await deleteEnvVariable(project._id, v._id);
                onUpdate(updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
