import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournal, BookStyle, JournalView } from '../context/JournalContext';
import SpreadController from './SpreadController';
import DecorationLayer from './DecorationLayer';
import { useCircadian } from '../hooks/useCircadian';
import { Bookmark, Calendar, Activity, Share2, Layers, Heart } from 'lucide-react';

interface PhysicalBookProps {
  children: ReactNode;
}

const PhysicalBook: React.FC<PhysicalBookProps> = ({ children }) => {
  const { state, dispatch } = useJournal();
  const circadian = useCircadian();

  const getStyleProps = (style: BookStyle) => {
    switch (style) {
      case 'modern':
        return {
          cover: 'bg-[#111111]', // Pure Black
          paper: circadian.paperColor,
          rings: 'bg-gray-400',
          binding: 'spiral',
        };
      default: // minimalist
        return {
          cover: 'bg-[#eeeeee]', // Light Grey
          paper: circadian.paperColor,
          rings: 'bg-transparent',
          binding: 'hidden',
        };
    }
  };

  const style = getStyleProps(state.bookStyle);

  const tabs: { view: JournalView; icon: any; color: string; label: string }[] = [
    { view: 'daily', icon: Bookmark, color: 'bg-[#222222]', label: 'Today' },
    { view: 'weekly', icon: Layers, color: 'bg-[#444444]', label: 'Weekly' },
    { view: 'calendar', icon: Calendar, color: 'bg-[#666666]', label: 'Planner' },
    { view: 'habit', icon: Activity, color: 'bg-[#166534]', label: 'Habits' }, // Green accent
    { view: 'pixels', icon: Heart, color: 'bg-[#888888]', label: 'Pixels' },
    { view: 'graph', icon: Share2, color: 'bg-[#000000]', label: 'Graph' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f5] p-4 lg:p-8 overflow-hidden">
      <motion.div 
        className="relative w-full max-w-7xl h-[92vh] flex shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden bg-white border border-black/5"
        animate={{ scale: state.isBookOpen ? 1 : 0.95 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <DecorationLayer />

        {/* PHYSICAL TABS */}
        <div className="absolute -right-1 top-24 bottom-24 w-12 flex flex-col gap-3 z-0">
          {tabs.map((tab) => (
            <button
              key={tab.view}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: tab.view })}
              className={`
                w-16 h-12 ${tab.color} rounded-r-lg shadow-sm flex items-center justify-end pr-4 text-white hover:w-20 transition-all group relative
                ${state.activeView === tab.view ? 'w-24 brightness-125 shadow-md' : 'opacity-90'}
              `}
            >
              <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>

        {/* LEFT PAGE */}
        <div 
          className="relative z-10 w-[40%] h-full border-r border-black/10 flex flex-col transition-colors duration-1000 overflow-hidden"
          style={{ backgroundColor: style.paper }}
        >
          <SpreadController />
        </div>

        {/* RIGHT PAGE */}
        <main 
          className="relative z-10 flex-1 h-full flex flex-col transition-colors duration-1000 overflow-hidden"
          style={{ backgroundColor: style.paper }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeView + state.selectedDate + (state.selectedCollectionId || '')}
              className="flex-1 h-full relative"
              initial={{ x: 5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -5, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="h-full w-full overflow-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Binding Divider */}
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-black/10 z-30" />

        {/* COVER OVERLAY */}
        <AnimatePresence>
          {!state.isBookOpen && (
            <motion.div 
              className={`absolute inset-0 z-50 ${style.cover} flex flex-col items-center justify-center text-white rounded-xl shadow-2xl`}
              initial={{ x: 0 }}
              exit={{ x: '-100%', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
            >
              <div className="flex flex-col items-center p-12 text-center border border-white/10 rounded-lg w-[85%] h-[85%] justify-center bg-white/5">
                 <div className="w-20 h-20 bg-white text-black rounded-lg flex items-center justify-center mb-8 shadow-xl">
                   <span className="text-4xl font-black tracking-tighter">BP</span>
                 </div>
                 <h1 className="text-5xl font-black tracking-tighter mb-4">BuJo Pro</h1>
                 <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.6em]">Methodical v4.6</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PhysicalBook;
