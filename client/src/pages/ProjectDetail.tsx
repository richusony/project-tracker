import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText, FileCode, KeyRound, DollarSign, Clock } from 'lucide-react';
import { getProject } from '../api';
import { IProject } from '../types';
import Timer from '../components/Timer';
import ConfigFiles from '../components/ConfigFiles';
import EnvVariables from '../components/EnvVariables';
import Pricing from '../components/Pricing';

type Tab = 'timer' | 'notes' | 'config' | 'env' | 'pricing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'timer', label: 'Timer', icon: <Clock className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'config', label: 'Config Files', icon: <FileCode className="w-4 h-4" /> },
  { id: 'env', label: 'Env Vars', icon: <KeyRound className="w-4 h-4" /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('timer');

  useEffect(() => {
    if (!id) return;
    getProject(id).then(setProject).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-20 text-slate-400">Project not found.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.brief && <p className="text-slate-400 text-sm mt-0.5">{project.brief}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl p-1">
        {TABS.map(t =>
          t.id === 'notes' ? (
            <Link
              key={t.id}
              to={`/projects/${id}/notes`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center tab-inactive"
            >
              {t.icon} {t.label}
            </Link>
          ) : (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
                tab === t.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {t.icon} {t.label}
            </button>
          )
        )}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {tab === 'timer' && <Timer project={project} onUpdate={setProject} />}
        {tab === 'config' && <ConfigFiles project={project} onUpdate={setProject} />}
        {tab === 'env' && <EnvVariables project={project} onUpdate={setProject} />}
        {tab === 'pricing' && <Pricing project={project} onUpdate={setProject} />}
      </div>
    </div>
  );
}
