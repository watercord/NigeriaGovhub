"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Blockquote from "@tiptap/extension-blockquote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { ControllerRenderProps, FieldError } from "react-hook-form";
import { NewsArticleFormData } from "@/types/client";

interface TiptapEditorProps {
  field: ControllerRenderProps<NewsArticleFormData, "content">;
  error?: FieldError;
}

export function TiptapEditor({ field, error }: TiptapEditorProps) {
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
      }),
      Blockquote,
    ],
    content: field.value || "<p>Write your article here...</p>",
    onUpdate: ({ editor }) => {
      field.onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg max-w-none p-4 border rounded-md min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary",
      },
    },
    immediatelyRender: false, // Fix SSR hydration mismatch
  });

  const addImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.secure_url) {
          editor.chain().focus().setImage({ src: data.secure_url }).run();
          toast({ title: "Image Uploaded", description: "Image added to article." });
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err) {
        console.error("[TiptapEditor] Upload failed:", err);
        toast({
          title: "Upload Failed",
          description: "Unable to upload image.",
          variant: "destructive",
        });
      }
    },
    [editor, toast]
  );

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-primary text-primary-foreground" : ""}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-primary text-primary-foreground" : ""}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-primary text-primary-foreground" : ""}
        >
          H1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : ""}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : ""}
        >
          Bullet List
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : ""}
        >
          Numbered List
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : ""}
        >
          Blockquote
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          Table
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            id="inline-image"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addImage(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("inline-image")?.click()}
          >
            Add Image
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
      {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
    </div>
  );
}