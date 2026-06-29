import { useState } from 'react';
import { FileCode, Plus, Trash2, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const { confirm } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete File',
      message: `Delete "${file.path}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try { await deleteConfigFile(projectId, file._id); onDelete(); }
    finally { setDeleting(false); }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-7 h-7 rounded-lg bg-surface-2 border border-stroke flex items-center justify-center flex-shrink-0">
          {open
            ? <ChevronDown className="w-3.5 h-3.5 text-ink-2" />
            : <ChevronRight className="w-3.5 h-3.5 text-ink-2" />
          }
        </div>
        <FileCode className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <span className="font-mono text-sm text-ink flex-1 truncate">{file.path}</span>
        <span className="text-xs text-ink-3 flex-shrink-0 hidden sm:block">
          {format(new Date(file.createdAt), 'MMM d, yyyy')}
        </span>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-ink-2 transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-stroke">
          <pre className="bg-canvas p-4 text-xs text-ink-2 font-mono overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
            {file.content}
          </pre>
        </div>
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
      setPath(''); setContent(''); setAdding(false);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-title">
          <FileCode className="w-4 h-4 text-brand-500" />
          Config Files
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary gap-1.5 text-sm py-1.5">
          <Plus className="w-3.5 h-3.5" /> Add File
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="card-p space-y-3 border-brand-500/30 animate-slide-up">
          <div>
            <label className="label">File Path</label>
            <input
              className="input font-mono"
              placeholder="e.g. studio-raaga/.env"
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
              placeholder="Paste the file content here…"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setPath(''); setContent(''); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!path.trim() || !content.trim() || loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving…' : 'Save File'}
            </button>
          </div>
        </form>
      )}

      {/* File list */}
      {project.configFiles.length === 0 && !adding ? (
        <div className="card-p text-center py-8">
          <FileCode className="w-10 h-10 text-ink-3 mx-auto mb-3" />
          <p className="text-sm text-ink-2">No config files added yet.</p>
        </div>
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
