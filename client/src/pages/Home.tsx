import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Folder, Trash2, ChevronRight } from 'lucide-react';
import { getProjects, deleteProject } from '../api';
import { IProject } from '../types';
import AddProjectModal from '../components/AddProjectModal';
import { format } from 'date-fns';

function formatSeconds(totalSeconds: number, isRunning: boolean, lastStarted?: string) {
  let secs = totalSeconds;
  if (isRunning && lastStarted) {
    secs += Math.floor((Date.now() - new Date(lastStarted).getTime()) / 1000);
  }
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ') || '0m';
}

function ProjectCard({ project, onDelete }: { project: IProject; onDelete: () => void }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!project.timer.isRunning) return;
    const i = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(i);
  }, [project.timer.isRunning]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(`Move "${project.name}" to trash?`)) return;
    await deleteProject(project._id);
    onDelete();
  };

  return (
    <Link to={`/projects/${project._id}`} className="card hover:border-brand-500/50 transition-colors group block">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <h2 className="font-semibold text-white text-lg leading-tight group-hover:text-brand-400 transition-colors">
            {project.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {project.timer.isRunning && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
            </span>
          )}
          <button onClick={handleDelete} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {project.brief && <p className="text-slate-400 text-sm mb-3 line-clamp-2">{project.brief}</p>}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatSeconds(project.timer.totalSeconds, project.timer.isRunning, project.timer.lastStarted)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
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
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <Folder className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-400 mb-2">No projects yet</h2>
          <p className="text-slate-500 mb-6">Create your first project to get started.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          onCreated={(p) => { setProjects(prev => [p, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
