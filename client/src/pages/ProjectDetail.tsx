import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, FileText, FileCode, KeyRound, DollarSign,
  Timer as TimerIcon, Pencil, Check, X, Archive,
} from 'lucide-react';
import { getProject, updateProject, deleteProject } from '../api';
import { IProject } from '../types';
import Timer from '../components/Timer';
import ConfigFiles from '../components/ConfigFiles';
import EnvVariables from '../components/EnvVariables';
import Pricing from '../components/Pricing';
import { useDialog } from '../components/DialogProvider';
import { StatusPicker } from '../components/StatusBadge';

type Tab = 'timer' | 'notes' | 'config' | 'env' | 'pricing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'timer',   label: 'Timer',        icon: <TimerIcon className="w-4 h-4" /> },
  { id: 'notes',   label: 'Notes',        icon: <FileText className="w-4 h-4" /> },
  { id: 'config',  label: 'Config Files', icon: <FileCode className="w-4 h-4" /> },
  { id: 'env',     label: 'Env Vars',     icon: <KeyRound className="w-4 h-4" /> },
  { id: 'pricing', label: 'Pricing',      icon: <DollarSign className="w-4 h-4" /> },
];

function Spinner() {
  return <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useDialog();
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
      setEditingTitle(false); return;
    }
    setSaving(true);
    try {
      setProject(await updateProject(project._id, { name: draftName.trim() }));
    } finally { setSaving(false); setEditingTitle(false); }
  };

  const saveBrief = async () => {
    if (!project || draftBrief === (project.brief ?? '')) {
      setEditingBrief(false); return;
    }
    setSaving(true);
    try {
      setProject(await updateProject(project._id, { brief: draftBrief.trim() }));
    } finally { setSaving(false); setEditingBrief(false); }
  };

  const handleStatusChange = async (status: IProject['status']) => {
    if (!project) return;
    setProject(await updateProject(project._id, { status }));
  };

  const handleArchive = async () => {
    if (!project) return;
    const ok = await confirm({
      title: 'Move to Archives',
      message: `Move "${project.name}" to archives?`,
      confirmLabel: 'Move to Archives',
      variant: 'warning',
    });
    if (!ok) return;
    await deleteProject(project._id);
    navigate('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  );
  if (!project) return (
    <div className="text-center py-20 text-ink-2">Project not found.</div>
  );

  return (
    <div className="animate-fade-in">
      {/* ── Breadcrumb + Header ── */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" />
          All Projects
        </Link>

        <div className="flex items-start justify-between gap-4">
          {/* Title + Brief */}
          <div className="flex-1 min-w-0 space-y-1">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleRef}
                  className="input text-xl font-bold py-1 px-2 h-auto rounded-lg"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                  disabled={saving}
                />
                <button onClick={saveTitle} disabled={saving || !draftName.trim()} className="btn-ghost p-1.5 text-brand-500">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingTitle(false)} className="btn-ghost p-1.5 text-ink-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <h1 className="text-2xl font-bold text-ink tracking-tight">{project.name}</h1>
                <button
                  onClick={startEditTitle}
                  className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-ink-3 hover:text-ink-2 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {editingBrief ? (
              <div className="flex items-center gap-2">
                <input
                  ref={briefRef}
                  className="input text-sm py-1 px-2 h-auto rounded-lg text-ink-2"
                  value={draftBrief}
                  placeholder="Add a description…"
                  onChange={e => setDraftBrief(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveBrief(); if (e.key === 'Escape') setEditingBrief(false); }}
                  disabled={saving}
                />
                <button onClick={saveBrief} disabled={saving} className="btn-ghost p-1.5 text-brand-500">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingBrief(false)} className="btn-ghost p-1.5 text-ink-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <p className="text-sm text-ink-2">
                  {project.brief || <span className="text-ink-3 italic">No description — click to add</span>}
                </p>
                <button
                  onClick={startEditBrief}
                  className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-ink-3 hover:text-ink-2 transition-all"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Archive button */}
          <button
            onClick={handleArchive}
            className="btn-secondary gap-2 flex-shrink-0 text-ink-2 hover:text-amber-500"
            title="Move to archives"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:block">Archive</span>
          </button>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-ink-3 font-medium">Status</span>
          <StatusPicker status={project.status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* ── Layout: Sidebar (lg) + Content ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar tabs (desktop) / Scrollable tabs (mobile) */}
        <aside className="flex-shrink-0 lg:w-48">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden gap-1 overflow-x-auto pb-1 tab-bar">
            {TABS.map(t =>
              t.id === 'notes' ? (
                <Link key={t.id} to={`/projects/${id}/notes`} className="tab-inactive">
                  {t.icon} {t.label}
                </Link>
              ) : (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={tab === t.id ? 'tab-active' : 'tab-inactive'}
                >
                  {t.icon} {t.label}
                </button>
              )
            )}
          </div>

          {/* Desktop: vertical sidebar */}
          <nav className="hidden lg:flex flex-col gap-1">
            {TABS.map(t =>
              t.id === 'notes' ? (
                <Link key={t.id} to={`/projects/${id}/notes`} className="stab-inactive">
                  {t.icon} {t.label}
                </Link>
              ) : (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={tab === t.id ? 'stab-active' : 'stab-inactive'}
                >
                  {t.icon} {t.label}
                </button>
              )
            )}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 animate-fade-in" key={tab}>
          {tab === 'timer'   && <Timer project={project} onUpdate={setProject} />}
          {tab === 'config'  && <ConfigFiles project={project} onUpdate={setProject} />}
          {tab === 'env'     && <EnvVariables project={project} onUpdate={setProject} />}
          {tab === 'pricing' && <Pricing project={project} onUpdate={setProject} />}
        </div>
      </div>
    </div>
  );
}
