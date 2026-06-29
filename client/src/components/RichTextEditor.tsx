import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import {
  Bold, Italic, List, Heading1, Heading2, Heading3,
  Link as LinkIcon, Youtube as YoutubeIcon, Code, Quote,
  ListOrdered, Minus,
} from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

function ToolbarBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: true, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'youtube-embed' } }),
      TextStyle,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-800 border-b border-slate-700">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-slate-700 mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-slate-700 mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
            <List className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
            <ListOrdered className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-slate-700 mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
            <Quote className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
            <Code className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
            <Minus className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-slate-700 mx-1" />
          <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Insert Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={addYoutube} active={false} title="Embed YouTube Video">
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarBtn>
        </div>
      )}
      <div className="p-4 bg-slate-900 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
