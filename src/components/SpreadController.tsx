import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import Calendar from './Calendar';
import StickerPalette from './StickerPalette';
import { 
  List, Activity, 
  Sparkles, History, TrendingUp,
  Check, ArrowRight, ArrowLeft, Minus, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpreadController: React.FC = () => {
  const { state, dispatch } = useJournal();
  const [activeRefView] = useState<'index' | 'scribe' | 'stickers' | 'templates'>('index');


  const keyItems = [
    { icon: Circle, label: 'Task', color: 'text-gray-400' },
    { icon: Check, label: 'Completed', color: 'text-[#6b705c]' },
    { icon: ArrowRight, label: 'Migrated', color: 'text-orange-400' },
    { icon: ArrowLeft, label: 'Scheduled', color: 'text-[#52796f]' },
    { icon: Minus, label: 'Note', color: 'text-gray-400' },
    { icon: Circle, label: 'Event', color: 'text-blue-400', fill: true },
  ];

  const renderLeftPage = () => {
    if (activeRefView === 'stickers') return <StickerPalette />;
    
    return (
      <div className="flex flex-col h-full p-8 space-y-8 select-none">
        {/* BUJO KEY */}
        <section>
          <h3 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">The Key</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {keyItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 flex items-center justify-center rounded bg-black/5`}>
                  <item.icon className={`w-3 h-3 ${item.color} ${item.fill ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[10px] font-bold text-[#52796f] uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* INDEX */}
        <section className="flex-1 min-h-0">
          <h3 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">The Index</h3>
          <div className="space-y-1.5 overflow-hidden">
            {[
              { view: 'daily', label: 'Daily Log', icon: List },
              { view: 'library', label: 'Archivist Shelf', icon: History },
              { view: 'habit', label: 'Daily Rituals', icon: Activity },
              { view: 'dashboard', label: 'Life Dashboard', icon: TrendingUp },
            ].map((item) => (
              <button 
                key={item.view}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view as any })} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group
                  ${state.activeView === item.view ? 'bg-[#6b705c] text-white shadow-sm' : 'hover:bg-black/5 text-[#52796f]'}
                `}
              >
                <item.icon className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                <span className="text-xs font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* COMPACT CALENDAR */}
        <section>
           <h3 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2">Chronos</h3>
           <Calendar />
        </section>

        {/* STREAK INDICATOR (Replacing Zen Garden) */}
        <section className="pt-4 border-t border-black/5">
           <div className="flex items-center justify-between p-4 bg-[#6b705c]/5 rounded-xl border border-[#6b705c]/10">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#6b705c] flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#2f3e46] uppercase tracking-widest leading-none">Reflection Streak</span>
                    <span className="text-[9px] font-bold text-[#6b705c] mt-1 italic">3 Days Consistent</span>
                 </div>
              </div>
              <div className="text-xl font-black text-[#6b705c]">3</div>
           </div>
        </section>
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRefView + state.activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderLeftPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpreadController;
