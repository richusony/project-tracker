import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, FolderOpen, Trash2, ChevronRight, Timer } from 'lucide-react';
import { getProjects, deleteProject } from '../api';
import { IProject } from '../types';
import AddProjectModal from '../components/AddProjectModal';
import { useDialog } from '../components/DialogProvider';
import { format } from 'date-fns';

function formatDuration(totalSeconds: number, isRunning: boolean, lastStarted?: string) {
  let secs = totalSeconds;
  if (isRunning && lastStarted) {
    secs += Math.floor((Date.now() - new Date(lastStarted).getTime()) / 1000);
  }
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '—';
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  );
}

function ProjectCard({ project, onDelete }: { project: IProject; onDelete: () => void }) {
  const [tick, setTick] = useState(0);
  const { confirm } = useDialog();

  useEffect(() => {
    if (!project.timer.isRunning) return;
    const i = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(i);
  }, [project.timer.isRunning]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: 'Move to Archives',
      message: `Move "${project.name}" to archives?`,
      confirmLabel: 'Move to Archives',
      variant: 'warning',
    });
    if (!ok) return;
    await deleteProject(project._id);
    onDelete();
  };

  const duration = formatDuration(project.timer.totalSeconds, project.timer.isRunning, project.timer.lastStarted);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card-interactive group flex flex-col p-5 gap-3 animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 border border-brand-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-brand-400/30 group-hover:to-brand-600/30 transition-all duration-200">
            <FolderOpen className="w-4 h-4 text-brand-500" />
          </div>
          <h2 className="font-semibold text-ink text-sm leading-snug truncate group-hover:text-brand-500 transition-colors duration-150">
            {project.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {project.timer.isRunning && (
            <span className="badge badge-green gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live
            </span>
          )}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-red-500 transition-all duration-150"
            tabIndex={-1}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
        {project.brief || <span className="text-ink-3 italic">No description</span>}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-stroke">
        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <Timer className="w-3.5 h-3.5" />
          <span className={project.timer.isRunning ? 'text-emerald-500 font-medium' : ''}>
            {duration}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-3">
          <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-stroke flex items-center justify-center mb-5">
        <FolderOpen className="w-8 h-8 text-ink-3" />
      </div>
      <h2 className="text-lg font-semibold text-ink mb-2">No projects yet</h2>
      <p className="text-sm text-ink-2 mb-6 max-w-xs">
        Create your first project to start tracking time, notes, and everything in between.
      </p>
      <button onClick={onCreate} className="btn-primary gap-2">
        <Plus className="w-4 h-4" /> New Project
      </button>
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">My Projects</h1>
          <p className="text-sm text-ink-2 mt-1">
            {projects.length === 0
              ? 'No projects yet'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {projects.length > 0 && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Project grid */}
      {projects.length === 0 ? (
        <EmptyState onCreate={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              onDelete={() => setProjects(prev => prev.filter(x => x._id !== p._id))}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddProjectModal
          onClose={() => setShowModal(false)}
          onCreated={p => { setProjects(prev => [p, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
