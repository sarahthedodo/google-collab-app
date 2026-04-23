import { motion } from 'motion/react';
import { Trash2, GripHorizontal } from 'lucide-react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { useState, useEffect } from 'react';

interface NoteProps {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  authorId: string;
  authorName: string;
}

export default function StickyNote({ id, content, color, x, y, authorId, authorName }: NoteProps) {
  const isOwner = auth.currentUser?.uid === authorId;
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleUpdateContent = async () => {
    if (!isOwner || localContent === content) return;
    try {
      await updateDoc(doc(db, 'notes', id), {
        content: localContent,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `notes/${id}`);
    }
  };

  const handlePositionChange = async (_: any, info: any) => {
    if (!isOwner) return;
    try {
      await updateDoc(doc(db, 'notes', id), {
        x: info.point.x,
        y: info.point.y,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
       handleFirestoreError(error, 'update', `notes/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `notes/${id}`);
    }
  };

  return (
    <motion.div
      drag={isOwner}
      dragMomentum={false}
      onDragEnd={handlePositionChange}
      initial={false}
      animate={{ x, y }}
      className="absolute p-5 w-64 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#D9D7C8]/60 backdrop-blur-[2px] rounded-3xl"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOwner && <GripHorizontal className="w-4 h-4 text-[#5A5A40]/40 cursor-grab active:cursor-grabbing" />}
          <span className="text-[9px] font-mono tracking-[0.2em] text-[#8A8878] uppercase font-bold">{authorName}</span>
        </div>
        {isOwner && (
          <button 
            onClick={handleDelete}
            className="p-1.5 hover:bg-[#5A5A40]/10 rounded-full transition-colors text-[#5A5A40]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleUpdateContent}
        readOnly={!isOwner}
        className="w-full bg-transparent border-none focus:ring-0 resize-none font-sans text-sm min-h-[120px] text-[#3D3D3D] leading-relaxed placeholder:text-[#8A8878]/40"
        placeholder="Share a thought..."
      />
      
      <div className="flex justify-end pt-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40]/20" />
      </div>
    </motion.div>
  );
}
