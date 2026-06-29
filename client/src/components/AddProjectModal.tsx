import { useState } from 'react';
import { X } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const project = await createProject({ name: name.trim(), brief: brief.trim() || undefined });
      onCreated(project);
    } catch {
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input
              className="input"
              placeholder="e.g. Studio Raaga Website"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Brief Description (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What is this project about?"
              value={brief}
              onChange={e => setBrief(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
