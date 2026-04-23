/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout, handleFirestoreError } from './lib/firebase';
import StickyNote from './components/StickyNote';
import { Plus, LogOut, StickyNote as StickyIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  '#fef9c3', // Yellow
  '#dcfce7', // Green
  '#dbeafe', // Blue
  '#fce7f3', // Pink
  '#f3e8ff', // Purple
  '#ffedd5', // Orange
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [showBoard, setShowBoard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Automatically show board if user is already logged in
      if (u) setShowBoard(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(newNotes);
    }, (error) => {
      handleFirestoreError(error, 'list', 'notes');
    });

    return () => unsubscribe();
  }, []);

  const addNote = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    try {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      await addDoc(collection(db, 'notes'), {
        content: '',
        color: randomColor,
        x: window.innerWidth / 2 - 128,
        y: window.innerHeight / 2 - 100,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'notes');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FDFCF8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D9D7C8]" />
      </div>
    );
  }

  if (!showBoard) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCF8] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="inline-flex p-5 bg-[#5A5A40] text-[#FDFCF8] rounded-[2.5rem] shadow-2xl">
            <StickyIcon className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-serif font-medium tracking-tight text-[#4A4A30]">
              Natural <span className="italic">Notes</span>
            </h1>
            <p className="text-[#8A8878] font-sans leading-relaxed text-lg">
              A calm space for shared ideas. Post, drag, and collaborate in real-time.
            </p>
          </div>
          <div className="space-y-3 w-full">
            <button
              onClick={() => setShowBoard(true)}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#5A5A40] text-[#FDFCF8] rounded-2xl font-medium transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-[#D9D7C8]/30"
            >
              Get Started
            </button>
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 text-[#5A5A40] font-medium hover:bg-[#E8E6D9]/30 rounded-xl transition-all"
            >
              <img src="https://www.gstatic.com/firebase/builtins/external/google_logo.svg" className="w-4 h-4 bg-white rounded-full p-0.5" alt="Google" referrerPolicy="no-referrer" />
              Sign in with Google
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen board-grid relative overflow-hidden bg-[#FDFCF8]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="p-3 bg-[#5A5A40] text-[#FDFCF8] rounded-2xl shadow-lg shadow-[#D9D7C8]/20">
            <StickyIcon className="w-6 h-6" />
          </div>
          <div className="bg-[#FDFCF8]/80 backdrop-blur px-4 py-2 rounded-2xl border border-[#D9D7C8]/50 shadow-sm">
            <h1 className="text-lg font-serif font-medium text-[#4A4A30]">
              Cloud <span className="italic">Board</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-[#D9D7C8]/30 mr-2">
            <div className="w-2 h-2 rounded-full bg-[#82A376] animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#8A8878] uppercase tracking-widest">Live Feed</span>
          </div>
          
          <div className="w-px h-8 bg-[#D9D7C8]/50 mx-2" />

          <button
            onClick={addNote}
            className="flex items-center gap-2 px-8 py-3 bg-[#5A5A40] text-[#FDFCF8] rounded-full font-medium shadow-xl shadow-[#D9D7C8]/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Note</span>
          </button>
          
          <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-[#D9D7C8]/50 shadow-sm">
            {user ? (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-[#E8E6D9] flex items-center justify-center overflow-hidden">
                   <img 
                     src={user.photoURL || ''} 
                     alt={user.displayName || ''} 
                     className="w-full h-full object-cover"
                     referrerPolicy="no-referrer" 
                   />
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-[#8A8878] hover:text-[#5A5A40] transition-colors mr-1"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-6 py-2 text-sm font-bold text-[#5A5A40] hover:text-[#4A4A30] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="w-full h-full">
        <AnimatePresence>
          {notes.map((note) => (
            <StickyNote key={note.id} {...note} />
          ))}
        </AnimatePresence>
        
        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-3xl font-serif italic text-[#D9D7C8] opacity-60">Ready for your first thought...</p>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-[#E8E6D9]/80 backdrop-blur border border-[#D9D7C8] rounded-full shadow-lg z-50 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8A8878]">
          {notes.length} Active Collective Documents {user ? '• Managed by you' : '• Guest Mode'}
        </p>
      </footer>
    </div>
  );
}
