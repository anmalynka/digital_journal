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
          cover: 'bg-[#2f3e46]',
          paper: circadian.paperColor,
          rings: 'bg-gray-300',
          binding: 'spiral',
        };
      default: // minimalist
        return {
          cover: 'bg-[#52796f]',
          paper: circadian.paperColor,
          rings: 'bg-transparent',
          binding: 'hidden',
        };
    }
  };

  const style = getStyleProps(state.bookStyle);

  const tabs: { view: JournalView; icon: any; color: string; label: string }[] = [
    { view: 'daily', icon: Bookmark, color: 'bg-[#6b705c]', label: 'Today' },
    { view: 'weekly', icon: Layers, color: 'bg-[#a5a58d]', label: 'Weekly' },
    { view: 'calendar', icon: Calendar, color: 'bg-[#52796f]', label: 'Planner' },
    { view: 'habit', icon: Activity, color: 'bg-[#354f52]', label: 'Habits' },
    { view: 'pixels', icon: Heart, color: 'bg-[#66717e]', label: 'Pixels' },
    { view: 'graph', icon: Share2, color: 'bg-[#2f3e46]', label: 'Graph' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f1f3f0] p-4 lg:p-8 overflow-hidden">
      <motion.div 
        className="relative w-full max-w-7xl h-[92vh] flex shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden bg-white"
        animate={{ scale: state.isBookOpen ? 1 : 0.95 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <DecorationLayer />

        {/* PHYSICAL TABS */}
        <div className="absolute -right-2 top-24 bottom-24 w-12 flex flex-col gap-4 z-0">
          {tabs.map((tab) => (
            <button
              key={tab.view}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: tab.view })}
              className={`
                w-16 h-12 ${tab.color} rounded-r-xl shadow-md flex items-center justify-end pr-4 text-white hover:w-20 transition-all group relative
                ${state.activeView === tab.view ? 'w-24 brightness-110 shadow-lg' : 'opacity-80'}
              `}
            >
              <tab.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>

        {/* LEFT PAGE - NO SCROLL */}
        <div 
          className="relative z-10 w-[40%] h-full border-r border-black/5 flex flex-col transition-colors duration-1000 overflow-hidden"
          style={{ backgroundColor: style.paper }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          <SpreadController />
        </div>

        {/* RIGHT PAGE - SCROLLABLE WORKSPACE */}
        <main 
          className="relative z-10 flex-1 h-full flex flex-col transition-colors duration-1000 overflow-hidden"
          style={{ backgroundColor: style.paper }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeView + state.selectedDate + (state.selectedCollectionId || '')}
              className="flex-1 h-full relative"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="h-full w-full overflow-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Binding Divider */}
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-black/5 z-30" />

        {/* COVER OVERLAY */}
        <AnimatePresence>
          {!state.isBookOpen && (
            <motion.div 
              className={`absolute inset-0 z-50 ${style.cover} flex flex-col items-center justify-center text-white rounded-2xl shadow-2xl`}
              initial={{ x: 0 }}
              exit={{ x: '-100%', transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }}
            >
              <div className="flex flex-col items-center p-12 text-center border border-white/10 rounded-xl w-[80%] h-[85%] justify-center bg-black/5">
                 <div className="w-24 h-24 bg-[#fdfbf7] text-[#2f3e46] rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                   <span className="text-5xl font-black tracking-tighter">BP</span>
                 </div>
                 <h1 className="text-6xl font-black tracking-tighter mb-4">BuJo Pro</h1>
                 <p className="text-sm font-bold opacity-30 uppercase tracking-[0.4em]">v4.5 Methodical</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PhysicalBook;
