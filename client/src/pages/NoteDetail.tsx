import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Edit2, X } from 'lucide-react';
import { getNote, updateNote } from '../api';
import { INote } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { format } from 'date-fns';

export default function NoteDetail() {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  const [note, setNote] = useState<INote | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!noteId) return;
    getNote(noteId).then(n => {
      setNote(n);
      setTitle(n.title);
      setContent(n.content);
    }).finally(() => setLoading(false));
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId || !note) return;
    setSaving(true);
    try {
      const updated = await updateNote(noteId, { title, content });
      setNote(updated);
      setEditing(false);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    setEditing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!note) return <div className="text-center py-20 text-slate-400">Note not found.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${id}/notes`} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              className="input text-xl font-bold bg-transparent border-none px-0 focus:ring-0"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          ) : (
            <h1 className="text-2xl font-bold text-white truncate">{note.title}</h1>
          )}
          <div className="text-xs text-slate-500 mt-1 space-x-3">
            <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}</span>
            {note.updatedAt !== note.createdAt && (
              <span>· Updated {format(new Date(note.updatedAt), 'MMM d, yyyy · h:mm a')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {saveMsg && <span className="text-green-400 text-sm">{saveMsg}</span>}
          {editing ? (
            <>
              <button onClick={handleCancel} className="btn-secondary flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <RichTextEditor content={content} onChange={setContent} editable={editing} />
    </div>
  );
}
