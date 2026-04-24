import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { motion } from 'framer-motion';
import { Book as BookIcon, History } from 'lucide-react';

const LibraryView: React.FC = () => {
  const { state, dispatch } = useJournal();

  const volumes = useMemo(() => {
    // Group everything by year for the "volumes" on the shelf
    const years = ['2026', '2025', '2024']; // Placeholder logic
    return years.map((y, i) => ({
      id: y,
      title: `${y} Chronicle`,
      color: i === 0 ? 'bg-[#52796f]' : i === 1 ? 'bg-[#2f3e46]' : 'bg-[#6b705c]',
      label: y
    }));
  }, []);

  const openVolume = (year: string) => {
    // In a real app, this would filter view to that year
    dispatch({ type: 'SET_DATE', payload: `${year}-01-01` });
    dispatch({ type: 'SET_VIEW', payload: 'daily' });
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 h-full flex flex-col">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-[#6b705c] mb-4 font-black uppercase tracking-[0.3em] text-[10px]">
          <History className="w-4 h-4" /> Archivist Access
        </div>
        <h1 className="text-5xl font-black text-[#2f3e46] tracking-tighter">Your Library</h1>
        <p className="text-sm font-medium text-[#a5a58d] mt-2">Every word, a brick in the wall of your history.</p>
      </header>

      {/* The 3D Shelf */}
      <div className="flex-1 relative flex items-end justify-center perspective-2000 pb-20">
        <div className="absolute bottom-16 left-0 right-0 h-8 bg-[#3d2b1f] shadow-2xl rounded-lg border-t border-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/5 blur-xl" />

        <div className="flex gap-4 items-end relative z-10 px-12">
          {volumes.map((vol, i) => (
            <motion.button
              key={vol.id}
              onClick={() => openVolume(vol.id)}
              className={`
                w-20 h-80 ${vol.color} rounded-lg shadow-2xl flex flex-col items-center justify-between py-10 text-white relative group
                transform-style-3d
              `}
              whileHover={{ 
                y: -40, 
                rotateY: -20, 
                z: 50,
                scale: 1.1,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Spine Text */}
              <div className="flex flex-col items-center">
                 <BookIcon className="w-6 h-6 mb-8 opacity-40" />
                 <div className="[writing-mode:vertical-rl] text-sm font-black uppercase tracking-[0.4em] rotate-180">
                   {vol.title}
                 </div>
              </div>
              <div className="text-xl font-black opacity-20">{vol.label}</div>

              {/* Shelf Reflection */}
              <div className="absolute -bottom-12 left-0 right-0 h-10 bg-black/10 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}

          {/* Empty space placeholders */}
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="w-16 h-64 bg-black/5 rounded-lg border-2 border-dashed border-black/5" />
          ))}
        </div>
      </div>

      <footer className="mt-auto grid grid-cols-3 gap-8 pt-12 border-t border-black/5">
         <div className="text-center">
            <div className="text-2xl font-black text-[#2f3e46]">{volumes.length}</div>
            <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Volumes</div>
         </div>
         <div className="text-center">
            <div className="text-2xl font-black text-[#2f3e46]">{state.collections.length}</div>
            <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Archives</div>
         </div>
         <div className="text-center">
            <div className="text-2xl font-black text-[#2f3e46]">2026</div>
            <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Active Year</div>
         </div>
      </footer>
    </div>
  );
};

export default LibraryView;
