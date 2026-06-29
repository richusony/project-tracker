import { useState, useEffect } from 'react';
import { Archive, FolderOpen, RotateCcw, Clock } from 'lucide-react';
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
    } finally { setRestoringId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2.5">
          <Archive className="w-6 h-6 text-ink-2" />
          Archives
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          {projects.length === 0
            ? 'No archived projects'
            : `${projects.length} archived project${projects.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-stroke flex items-center justify-center mb-4">
            <Archive className="w-7 h-7 text-ink-3" />
          </div>
          <h2 className="text-base font-semibold text-ink mb-1">Nothing archived yet</h2>
          <p className="text-sm text-ink-2">Projects you archive will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p._id} className="card-p flex items-center gap-4 animate-slide-up">
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-4 h-4 text-ink-3" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink truncate">{p.name}</p>
                {p.brief && <p className="text-xs text-ink-2 truncate mt-0.5">{p.brief}</p>}
              </div>

              {/* Archived date */}
              {p.deletedAt && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-3 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(p.deletedAt), 'MMM d, yyyy')}
                </div>
              )}

              {/* Restore button */}
              <button
                onClick={() => handleRestore(p)}
                disabled={restoringId === p._id}
                className="btn-secondary gap-1.5 flex-shrink-0 text-sm"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${restoringId === p._id ? 'animate-spin' : ''}`} />
                {restoringId === p._id ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
