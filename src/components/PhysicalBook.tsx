import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournal, BookStyle } from '../context/JournalContext';

interface PhysicalBookProps {
  children: ReactNode;
  sidebar: ReactNode;
}

const PhysicalBook: React.FC<PhysicalBookProps> = ({ children, sidebar }) => {
  const { state } = useJournal();

  const getStyleProps = (style: BookStyle) => {
    switch (style) {
      case 'modern':
        return {
          cover: 'bg-[#2f3e46]', // Slate Charcoal
          paper: 'bg-white',
          rings: 'bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400',
          binding: 'spiral',
        };
      default: // minimalist
        return {
          cover: 'bg-[#52796f]', // Soft Sage
          paper: 'bg-[#fdfcf0]', // Warm Cream
          rings: 'bg-transparent',
          binding: 'hidden',
        };
    }
  };

  const style = getStyleProps(state.bookStyle);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f1f3f0] p-4 lg:p-8 overflow-hidden">
      <motion.div 
        className="relative w-full max-w-7xl h-[85vh] flex shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)] rounded-[20px] overflow-hidden"
        initial={false}
        animate={{ scale: state.isBookOpen ? 1 : 0.95 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left Side (Sidebar) - The "Fixed" Page */}
        <aside 
          className={`relative z-10 w-80 lg:w-[32%] h-full ${style.paper} border-r border-[#e0e2db] flex flex-col shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.05)]`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          {sidebar}
        </aside>

        {/* Right Side (Main Content) - The "Turning" Page area */}
        <main className={`relative flex-1 h-full ${style.paper} flex flex-col shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.05)]`}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeView + state.selectedDate + (state.selectedCollectionId || '')}
              className="flex-1 h-full relative"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Page Edge Thickness */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/5" />
        </main>

        {/* Center Spine Shadow */}
        <div className="absolute left-[32%] top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-black/5 via-black/10 to-black/5 z-20 pointer-events-none" />

        {/* Binding Details */}
        <div className="absolute left-[32%] top-0 bottom-0 w-0 flex flex-col items-center justify-around py-12 z-30 pointer-events-none">
          {style.binding === 'spiral' && Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`w-6 h-1 -ml-3 mb-1 rounded-full shadow-sm ${style.rings} transform -rotate-12 border border-black/5`} />
          ))}
        </div>

        {/* Front Cover Animation (Simplified to prevent offset issues) */}
        <AnimatePresence>
          {!state.isBookOpen && (
            <motion.div 
              className={`absolute inset-0 z-50 ${style.cover} flex flex-col items-center justify-center text-white`}
              initial={{ x: 0 }}
              exit={{ x: '-100%', transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
            >
              <div className="flex flex-col items-center p-12 text-center border-2 border-white/10 rounded-[40px] w-[80%] h-[85%] justify-center">
                 <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mb-8">
                   <span className="text-5xl font-black tracking-tighter">BP</span>
                 </div>
                 <h1 className="text-6xl font-black tracking-tighter mb-4">BuJo Pro</h1>
                 <p className="text-sm font-bold opacity-40 uppercase tracking-[0.4em]">Scribe Edition 2026</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PhysicalBook;
