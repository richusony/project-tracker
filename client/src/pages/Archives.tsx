import { useState, useEffect } from 'react';
import { Archive, Folder, RotateCcw } from 'lucide-react';
import { getArchivedProjects, restoreProject } from '../api';
import { IProject } from '../types';
import { format } from 'date-fns';

export default function Archives() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    getArchivedProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const handleRestore = async (project: IProject) => {
    setRestoringId(project._id);
    try {
      await restoreProject(project._id);
      setProjects(prev => prev.filter(p => p._id !== project._id));
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Archive className="w-6 h-6 text-slate-400" /> Archives
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {projects.length} deleted project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <Archive className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-400 mb-2">No archived projects</h2>
          <p className="text-slate-500">Deleted projects will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p._id} className="card flex items-center gap-3">
              <Folder className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-300 truncate">{p.name}</p>
                {p.brief && <p className="text-slate-500 text-sm truncate">{p.brief}</p>}
              </div>
              <div className="text-xs text-slate-600 flex-shrink-0">
                Deleted {p.deletedAt ? format(new Date(p.deletedAt), 'MMM d, yyyy') : ''}
              </div>
              <button
                onClick={() => handleRestore(p)}
                disabled={restoringId === p._id}
                className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {restoringId === p._id ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
