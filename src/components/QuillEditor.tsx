'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const isInitialized = useRef(false);

  // Debugging: Log mount
  console.log('[QuillEditor] Mounting component');

  useEffect(() => {
    if (quillRef.current && !isInitialized.current) {
      console.log('[QuillEditor] Initializing Quill instance');
      quillInstance.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
           [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }], 
            [{ size: ['small', false, 'large', 'huge'] }], 
            ['bold', 'italic', 'underline', 'strike'], 
            [{ color: [] }, { background: [] }], 
            [{ script: 'super' }, { script: 'sub' }], 
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'], 
            ['blockquote', 'code-block'], 
            [{ align: [] }], 
            // ['undo', 'redo'], 
            ['table'], 
            ['clean'], 
          ],
          table: true, 
        },
        placeholder: 'Write your article content here...',
      });

      // Initialize content
      if (value) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(value);
      }

      // Handle text changes
      const handleTextChange = () => {
        console.log('[QuillEditor] Text changed');
        onChange(quillInstance.current!.root.innerHTML);
      };
      quillInstance.current.on('text-change', handleTextChange);

      // Handle image uploads
      const toolbar = quillInstance.current.getModule('toolbar');
      const handleImageUpload = async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
              });
              const data = await response.json();
              if (data.secure_url) {
                const range = quillInstance.current!.getSelection();
                if (range) {
                  quillInstance.current!.insertEmbed(range.index, 'image', data.secure_url);
                }
              } else {
                console.error('[QuillEditor] Image upload failed:', data.error);
              }
            } catch (error) {
              console.error('[QuillEditor] Error uploading image:', error);
            }
          }
        };
      };
      (toolbar as any).addHandler('image', handleImageUpload);

      isInitialized.current = true;
    }

    // Cleanup function - only reset the initialization flag if we actually have an instance
    return () => {
      if (quillInstance.current) {
        quillInstance.current.off('text-change');
        quillInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, []); // Empty dependency array - we only want to initialize once


  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  return (
    <div>
      <div ref={quillRef} className="min-h-[300px] bg-white border rounded" />
    </div>
  );
}
