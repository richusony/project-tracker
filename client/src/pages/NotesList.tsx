import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronLeft, Trash2, ChevronRight } from 'lucide-react';
import { getNotesByProject, getProject, createNote, deleteNote } from '../api';
import { INote, IProject } from '../types';
import { useDialog } from '../components/DialogProvider';
import { format } from 'date-fns';

export default function NotesList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const [notes, setNotes] = useState<INote[]>([]);
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getProject(id), getNotesByProject(id)])
      .then(([proj, nts]) => { setProject(proj); setNotes(nts); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !id) return;
    const note = await createNote({ projectId: id, title: newTitle.trim() });
    navigate(`/projects/${id}/notes/${note._id}`);
  };

  const handleDelete = async (noteId: string, title: string) => {
    const ok = await confirm({
      title: 'Delete Note',
      message: `Delete "${title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    await deleteNote(noteId);
    setNotes(prev => prev.filter(n => n._id !== noteId));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${id}`} className="btn-ghost p-2 rounded-xl">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">{project?.name}</p>
          <h1 className="text-xl font-bold text-ink tracking-tight">Notes</h1>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Create inline form */}
      {creating && (
        <form onSubmit={handleCreate} className="card-p mb-4 animate-slide-up">
          <label className="label">Note Title</label>
          <input
            className="input mb-3"
            placeholder="Give your note a title…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setCreating(false); setNewTitle(''); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={!newTitle.trim()} className="btn-primary">
              Create Note
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {notes.length === 0 && !creating ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-stroke flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-ink-3" />
          </div>
          <h2 className="text-base font-semibold text-ink mb-1">No notes yet</h2>
          <p className="text-sm text-ink-2 mb-5">Start capturing thoughts, ideas, and docs for this project.</p>
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <div
              key={note._id}
              className="card-interactive group flex items-center gap-3 px-5 py-4 animate-slide-up"
            >
              <Link to={`/projects/${id}/notes/${note._id}`} className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink truncate group-hover:text-brand-500 transition-colors">
                    {note.title}
                  </p>
                  <p className="text-xs text-ink-3 mt-0.5">
                    {format(new Date(note.updatedAt !== note.createdAt ? note.updatedAt : note.createdAt), 'MMM d, yyyy · h:mm a')}
                    {note.updatedAt !== note.createdAt && ' (edited)'}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(note._id, note.title)}
                  className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-ink-3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
