"use client";

import { useEffect, useRef } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

type RichEditorProps = {
  value?: JSONContent | null;
  placeholder?: string;
  editable?: boolean;
  onChange?: (doc: JSONContent) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
  onFocus?: () => void;
  onBlur?: () => void;
};

const ensureDoc = (value?: JSONContent | null): JSONContent => {
  if (value && typeof value === "object") return value;
  return { type: "doc", content: [{ type: "paragraph" }] };
};

export function RichEditor({
  value,
  placeholder,
  editable = true,
  onChange,
  onImageUpload,
  onFocus,
  onBlur,
}: RichEditorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write something...",
      }),
    ],
    content: ensureDoc(value),
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "text-sm text-[var(--muted-foreground)] focus:outline-none transition-all",
          editable
            ? "min-h-[44px] py-1 placeholder:opacity-30 bg-transparent border-none shadow-none cursor-text"
            : "min-h-0 p-0",
        ),
      },
      handlePaste: (_view, event) => {
        if (!onImageUpload) return false;
        const files = Array.from(event.clipboardData?.files ?? []);
        const image = files.find((file) => file.type.startsWith("image/"));
        if (!image) return false;
        void uploadImage(image);
        return true;
      },
      handleDrop: (_view, event) => {
        if (!onImageUpload) return false;
        const files = Array.from(event.dataTransfer?.files ?? []);
        const image = files.find((file) => file.type.startsWith("image/"));
        if (!image) return false;
        void uploadImage(image);
        return true;
      },
    },
  });

  const uploadImage = async (file: File) => {
    if (!editor) return;
    const url = onImageUpload ? await onImageUpload(file) : null;
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  useEffect(() => {
    if (!editor || !onChange) return;
    const handleUpdate = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onChange(editor.getJSON());
      }, 600);
    };
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    const next = ensureDoc(value);
    if (JSON.stringify(next) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(next);
    }
  }, [editor, value]);

  return (
    <div
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      onMouseDownCapture={onFocus}
      className="tiptap-wrapper"
    >
      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}
