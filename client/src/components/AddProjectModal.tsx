import { useState, useEffect, useRef } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { createProject } from '../api';
import { IProject } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (project: IProject) => void;
}

export default function AddProjectModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const project = await createProject({ name: name.trim(), brief: brief.trim() || undefined });
      onCreated(project);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-canvas/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md shadow-modal animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-stroke">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 border border-brand-500/20 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-ink text-base">New Project</h2>
            <p className="text-xs text-ink-3 mt-0.5">Fill in the details to get started</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl text-ink-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input
              ref={nameRef}
              className="input"
              placeholder="e.g. Studio Raaga Website"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Description <span className="text-ink-3 normal-case font-normal tracking-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What is this project about?"
              value={brief}
              onChange={e => setBrief(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
