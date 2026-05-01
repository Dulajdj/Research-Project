// components/ui/RichTextEditor.jsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, Save } from "lucide-react";
import { saveCoverLetter } from "@/actions/cover-letter";
import { toast } from "sonner";

export default function RichTextEditor({ content, coverLetterId }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "<p>Start writing your cover letter...</p>",
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-96 p-6",
      },
    },
  });

  // Load content when editor is ready
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleSave = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    try {
      await saveCoverLetter(coverLetterId, html);
      toast.success("Saved successfully!");
    } catch (err) {
      toast.error("Save failed");
    }
  };

  if (!editor) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10 text-center">
        <p className="text-white">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "default" : "secondary"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Bold className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("italic") ? "default" : "secondary"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Italic className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("underline") ? "default" : "secondary"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <UnderlineIcon className="w-5 h-5" />
          </Button>
          <div className="w-px bg-white/30 mx-2" />
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "secondary"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <AlignLeft className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "secondary"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <AlignCenter className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "secondary"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <AlignRight className="w-5 h-5" />
          </Button>
        </div>
        <Button
          onClick={handleSave}
          className="bg-white text-purple-600 hover:bg-gray-100 font-bold flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </Button>
      </div>

      {/* Editor */}
      <div className="bg-white min-h-screen">
        <EditorContent editor={editor} className="prose prose-lg max-w-none p-10" />
      </div>
    </div>
  );
}