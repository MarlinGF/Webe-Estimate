'use client';

import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import History from '@tiptap/extension-history';
import { useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { stripHtml } from '@/lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  userId?: string | null;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  userId = 'anonymous',
}) => {
  const { storage } = useFirebase();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        history: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
      History,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Image,
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
  });

  // keep editor in sync if parent value changes programmatically
  useEffect(() => {
    if (!editor) return;
    const isSame = editor.getHTML() === value;
    if (isSame) {
      return;
    }
    editor.commands.setContent(value, false);
  }, [value, editor]);

  if (!editor) return null;

  const handleImageUpload = async (file: File) => {
    if (!storage) {
        alert("Firebase Storage is not available. Cannot upload image.");
        return;
    }
    try {
      const path = `lineItemImages/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: file.name })
        .run();
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('There was a problem uploading the image.');
    }
  };

  const triggerImagePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await handleImageUpload(file);
    };
    input.click();
  };

  return (
    <div className="border border-input rounded-md bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-input bg-muted/50 text-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          U
        </button>

        <span className="mx-1 border-l h-5 border-border" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-2 py-1 rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2 py-1 rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-2 py-1 rounded ${
            editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          H3
        </button>

        <span className="mx-1 border-l h-5 border-border" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          1. List
        </button>

        <span className="mx-1 border-l h-5 border-border" />

        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`px-2 py-1 rounded ${
            editor.isActive('link') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          Link
        </button>

        <button
          type="button"
          onClick={triggerImagePicker}
          className="px-2 py-1 rounded hover:bg-accent"
        >
          Image
        </button>

        <span className="mx-1 border-l h-5 border-border" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded hover:bg-accent disabled:opacity-50"
          disabled={!editor.can().undo()}
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded hover:bg-accent disabled:opacity-50"
           disabled={!editor.can().redo()}
        >
          ↻
        </button>
      </div>
       <div className="relative">
        {placeholder && !editor.getText() && (
          <div className="absolute top-2 left-3 text-muted-foreground select-none pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
       </div>
    </div>
  );
};

    