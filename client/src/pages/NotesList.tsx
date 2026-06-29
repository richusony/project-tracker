import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronLeft, Trash2 } from 'lucide-react';
import { getNotesByProject, getProject, createNote, deleteNote } from '../api';
import { INote, IProject } from '../types';
import { useDialog } from '../components/DialogProvider';
import { format } from 'date-fns';

export default function NotesList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<INote[]>([]);
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { confirm } = useDialog();

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

  const handleDelete = async (noteId: string) => {
    const ok = await confirm({ title: 'Delete Note', message: 'Delete this note? This cannot be undone.', confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    await deleteNote(noteId);
    setNotes(prev => prev.filter(n => n._id !== noteId));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${id}`} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-slate-500 text-sm">{project?.name}</p>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card mb-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Note title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          <button type="button" onClick={() => { setCreating(false); setNewTitle(''); }} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={!newTitle.trim()} className="btn-primary">Create</button>
        </form>
      )}

      {notes.length === 0 && !creating ? (
        <div className="text-center py-20">
          <FileText className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No notes yet. Create your first note.</p>
          <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4 inline mr-1" /> New Note</button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note._id} className="card hover:border-brand-500/40 transition-colors group flex items-center gap-3">
              <Link to={`/projects/${id}/notes/${note._id}`} className="flex-1 flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{note.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Created {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}
                    {note.updatedAt !== note.createdAt && (
                      <> · Updated {format(new Date(note.updatedAt), 'MMM d, yyyy · h:mm a')}</>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(note._id)}
                className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
