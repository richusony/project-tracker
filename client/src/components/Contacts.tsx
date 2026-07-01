import { useState } from 'react';
import {
  Users, Plus, Trash2, Pencil, Mail, Phone, Video, Link2, Copy, Check, X,
} from 'lucide-react';
import { addContact, updateContact, deleteContact } from '../api';
import { IProject, IContact, IMeetingLink } from '../types';
import { useDialog } from './DialogProvider';

type Platform = IMeetingLink['platform'];

const PLATFORM_LABELS: Record<Platform, string> = {
  'google-meet': 'Google Meet',
  zoom: 'Zoom',
  teams: 'Teams',
  other: 'Other',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  'google-meet': 'bg-emerald-500/10 text-emerald-500',
  zoom: 'bg-sky-500/10 text-sky-500',
  teams: 'bg-violet-500/10 text-violet-500',
  other: 'badge-slate',
};

type DraftLink = Omit<IMeetingLink, '_id'>;

interface FormState {
  name: string;
  role: string;
  email: string;
  phone: string;
  meetingLinks: DraftLink[];
}

const emptyForm: FormState = { name: '', role: '', email: '', phone: '', meetingLinks: [] };

function ContactForm({ initial, onCancel, onSave }: {
  initial: FormState;
  onCancel: () => void;
  onSave: (form: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [linkPlatform, setLinkPlatform] = useState<Platform>('google-meet');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const addLink = () => {
    if (!linkUrl.trim()) return;
    setForm(f => ({
      ...f,
      meetingLinks: [...f.meetingLinks, { platform: linkPlatform, url: linkUrl.trim(), label: linkLabel.trim() || undefined }],
    }));
    setLinkUrl(''); setLinkLabel('');
  };

  const removeLink = (idx: number) => {
    setForm(f => ({ ...f, meetingLinks: f.meetingLinks.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="card-p space-y-3 border-brand-500/30 animate-slide-up">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Name</label>
          <input className="input" placeholder="Jane Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" placeholder="Client, PM…" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="tel" className="input" placeholder="+1 555 123 4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="label">Meeting Links</label>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="input w-auto"
            value={linkPlatform}
            onChange={e => setLinkPlatform(e.target.value as Platform)}
          >
            {(Object.keys(PLATFORM_LABELS) as Platform[]).map(p => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </select>
          <input
            className="input flex-1 min-w-[10rem]"
            placeholder="https://meet.google.com/…"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
          />
          <input
            className="input w-32"
            placeholder="Label (optional)"
            value={linkLabel}
            onChange={e => setLinkLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
          />
          <button type="button" onClick={addLink} disabled={!linkUrl.trim()} className="btn-secondary p-2">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {form.meetingLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.meetingLinks.map((link, idx) => (
              <span key={idx} className={`badge gap-1.5 ${PLATFORM_COLORS[link.platform]}`}>
                <Video className="w-3 h-3" />
                {link.label || PLATFORM_LABELS[link.platform]}
                <button type="button" onClick={() => removeLink(idx)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={!form.name.trim() || loading} className="btn-primary flex-1">
          {loading ? 'Saving…' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}

function CopyableRow({ icon, value, href }: { icon: React.ReactNode; value: string; href: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2 text-sm text-ink-2 group/row">
      {icon}
      <a href={href} className="truncate hover:text-brand-500 transition-colors">{value}</a>
      <button onClick={handleCopy} className="opacity-0 group-hover/row:opacity-100 btn-ghost p-1 rounded-lg text-ink-3 hover:text-ink-2 transition-all">
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function ContactCard({ contact, projectId, onUpdate }: {
  contact: IContact; projectId: string; onUpdate: (p: IProject) => void;
}) {
  const [editing, setEditing] = useState(false);
  const { confirm } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Contact',
      message: `Delete "${contact.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    onUpdate(await deleteContact(projectId, contact._id));
  };

  const handleSave = async (form: FormState) => {
    onUpdate(await updateContact(projectId, contact._id, {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      meetingLinks: form.meetingLinks,
    }));
    setEditing(false);
  };

  if (editing) {
    return (
      <ContactForm
        initial={{
          name: contact.name,
          role: contact.role ?? '',
          email: contact.email ?? '',
          phone: contact.phone ?? '',
          meetingLinks: contact.meetingLinks.map(({ platform, url, label }) => ({ platform, url, label })),
        }}
        onCancel={() => setEditing(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="card-p group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{contact.name}</p>
          {contact.role && <p className="text-xs text-ink-3">{contact.role}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing(true)} className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-ink-2">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete} className="btn-ghost p-1.5 rounded-lg text-ink-3 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {(contact.email || contact.phone) && (
        <div className="mt-3 space-y-1.5">
          {contact.email && <CopyableRow icon={<Mail className="w-3.5 h-3.5 flex-shrink-0 text-ink-3" />} value={contact.email} href={`mailto:${contact.email}`} />}
          {contact.phone && <CopyableRow icon={<Phone className="w-3.5 h-3.5 flex-shrink-0 text-ink-3" />} value={contact.phone} href={`tel:${contact.phone}`} />}
        </div>
      )}

      {contact.meetingLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {contact.meetingLinks.map(link => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`badge gap-1.5 hover:opacity-80 transition-opacity ${PLATFORM_COLORS[link.platform]}`}
            >
              <Video className="w-3 h-3" />
              {link.label || PLATFORM_LABELS[link.platform]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

export default function Contacts({ project, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async (form: FormState) => {
    const updated = await addContact(project._id, {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      meetingLinks: form.meetingLinks,
    });
    onUpdate(updated);
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="section-title">
          <Users className="w-4 h-4 text-brand-500" />
          Contacts
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary gap-1.5 text-sm py-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Contact
        </button>
      </div>

      {adding && (
        <ContactForm initial={emptyForm} onCancel={() => setAdding(false)} onSave={handleAdd} />
      )}

      {project.contacts.length === 0 && !adding ? (
        <div className="card-p text-center py-8">
          <Link2 className="w-10 h-10 text-ink-3 mx-auto mb-3" />
          <p className="text-sm text-ink-2">No contacts added yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {project.contacts.map(c => (
            <ContactCard key={c._id} contact={c} projectId={project._id} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
