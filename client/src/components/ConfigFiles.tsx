import { useState } from 'react';
import { FileCode, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { addConfigFile, deleteConfigFile } from '../api';
import { IProject, IConfigFile } from '../types';
import { useDialog } from './DialogProvider';
import { format } from 'date-fns';

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

function FileItem({ file, projectId, onDelete }: { file: IConfigFile; projectId: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { confirm } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Delete File', message: `Delete "${file.path}"? This cannot be undone.`, confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    setDeleting(true);
    try { await deleteConfigFile(projectId, file._id); onDelete(); }
    finally { setDeleting(false); }
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <FileCode className="w-4 h-4 text-brand-500" />
        <span className="font-mono text-sm text-slate-200 flex-1">{file.path}</span>
        <span className="text-xs text-slate-500">{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
        <button
          onClick={e => { e.stopPropagation(); handleDelete(); }}
          disabled={deleting}
          className="text-slate-500 hover:text-red-400 transition-colors ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <pre className="bg-slate-950 p-4 text-xs text-slate-300 font-mono overflow-x-auto border-t border-slate-700 max-h-80 overflow-y-auto">
          {file.content}
        </pre>
      )}
    </div>
  );
}

export default function ConfigFiles({ project, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const name = path.split('/').pop() || path;
      const updated = await addConfigFile(project._id, { name, path: path.trim(), content: content.trim() });
      onUpdate(updated);
      setPath('');
      setContent('');
      setAdding(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-brand-500" />
          Config Files
        </h3>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
          <Plus className="w-4 h-4" /> Add File
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card space-y-3 border-brand-500/30">
          <div>
            <label className="label">File Path</label>
            <input
              className="input font-mono text-sm"
              placeholder="studio-raaga/.env"
              value={path}
              onChange={e => setPath(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">File Content</label>
            <textarea
              className="input font-mono text-xs resize-none"
              rows={10}
              placeholder="Paste the file content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setAdding(false); setPath(''); setContent(''); }} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!path.trim() || !content.trim() || loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save File'}
            </button>
          </div>
        </form>
      )}

      {project.configFiles.length === 0 && !adding ? (
        <p className="text-slate-500 text-sm text-center py-6">No config files added yet.</p>
      ) : (
        <div className="space-y-2">
          {project.configFiles.map(file => (
            <FileItem
              key={file._id}
              file={file}
              projectId={project._id}
              onDelete={async () => {
                const updated = await deleteConfigFile(project._id, file._id);
                onUpdate(updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
