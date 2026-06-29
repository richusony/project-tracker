import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Edit2, X, Check } from 'lucide-react';
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!noteId) return;
    getNote(noteId).then(n => {
      setNote(n);
      setTitle(n.title);
      setContent(n.content);
      if (!n.content) setEditing(true);
    }).finally(() => setLoading(false));
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId || !note) return;
    setSaving(true);
    try {
      const updated = await updateNote(noteId, { title, content });
      setNote(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    setEditing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!note) return <div className="text-center py-20 text-ink-2">Note not found.</div>;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link to={`/projects/${id}/notes`} className="btn-ghost p-2 rounded-xl mt-0.5 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              className="input text-xl font-bold py-1 px-2 rounded-lg mb-1"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note title"
            />
          ) : (
            <h1 className="text-2xl font-bold text-ink tracking-tight">{note.title}</h1>
          )}
          <p className="text-xs text-ink-3 mt-1">
            Created {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}
            {note.updatedAt !== note.createdAt && (
              <> · Updated {format(new Date(note.updatedAt), 'MMM d, yyyy · h:mm a')}</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {editing ? (
            <>
              <button onClick={handleCancel} className="btn-secondary gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary gap-1.5">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary gap-1.5">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="card overflow-hidden">
        <RichTextEditor content={content} onChange={setContent} editable={editing} />
      </div>
    </div>
  );
}
