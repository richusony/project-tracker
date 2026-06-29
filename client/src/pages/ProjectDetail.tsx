import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, FileCode, KeyRound, DollarSign, Clock, Pencil, Check, X, Trash2 } from 'lucide-react';
import { getProject, updateProject, deleteProject } from '../api';
import { IProject } from '../types';
import Timer from '../components/Timer';
import ConfigFiles from '../components/ConfigFiles';
import EnvVariables from '../components/EnvVariables';
import Pricing from '../components/Pricing';
import { useDialog } from '../components/DialogProvider';

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
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('timer');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBrief, setEditingBrief] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftBrief, setDraftBrief] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const briefRef = useRef<HTMLInputElement>(null);
  const { confirm } = useDialog();

  useEffect(() => {
    if (!id) return;
    getProject(id).then(setProject).finally(() => setLoading(false));
  }, [id]);

  const startEditTitle = () => {
    if (!project) return;
    setDraftName(project.name);
    setEditingTitle(true);
    setTimeout(() => titleRef.current?.select(), 0);
  };

  const startEditBrief = () => {
    if (!project) return;
    setDraftBrief(project.brief ?? '');
    setEditingBrief(true);
    setTimeout(() => briefRef.current?.select(), 0);
  };

  const saveTitle = async () => {
    if (!project || !draftName.trim() || draftName.trim() === project.name) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProject(project._id, { name: draftName.trim() });
      setProject(updated);
    } finally {
      setSaving(false);
      setEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    const ok = await confirm({ title: 'Move to Archives', message: `Move "${project.name}" to archives?`, confirmLabel: 'Move to Archives', variant: 'warning' });
    if (!ok) return;
    await deleteProject(project._id);
    navigate('/');
  };

  const saveBrief = async () => {
    if (!project || draftBrief === (project.brief ?? '')) {
      setEditingBrief(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProject(project._id, { brief: draftBrief.trim() });
      setProject(updated);
    } finally {
      setSaving(false);
      setEditingBrief(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-20 text-slate-400">Project not found.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="space-y-0.5 flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={titleRef}
                className="input text-xl font-bold py-0.5 px-2 h-auto"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                disabled={saving}
              />
              <button onClick={saveTitle} disabled={saving || !draftName.trim()} className="text-brand-400 hover:text-brand-300 disabled:opacity-40"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingTitle(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="group flex items-center gap-1.5">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <button onClick={startEditTitle} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"><Pencil className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {editingBrief ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={briefRef}
                className="input text-sm py-0.5 px-2 h-auto text-slate-300"
                value={draftBrief}
                placeholder="Add a description…"
                onChange={e => setDraftBrief(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveBrief(); if (e.key === 'Escape') setEditingBrief(false); }}
                disabled={saving}
              />
              <button onClick={saveBrief} disabled={saving} className="text-brand-400 hover:text-brand-300 disabled:opacity-40"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingBrief(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="group flex items-center gap-1.5">
              <p className="text-slate-400 text-sm">{project.brief || <span className="italic text-slate-600">No description</span>}</p>
              <button onClick={startEditBrief} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"><Pencil className="w-3 h-3" /></button>
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="ml-auto text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
          title="Move to archives"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
