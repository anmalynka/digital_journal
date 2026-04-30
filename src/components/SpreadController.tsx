import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import Calendar from './Calendar';
import StickerPalette from './StickerPalette';
import { 
  List, Activity, Sparkles, History, TrendingUp,
  Check, ArrowRight, ArrowLeft, Minus, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpreadController: React.FC = () => {
  const { state, dispatch } = useJournal();
  const [activeRefView] = useState<'index' | 'scribe' | 'stickers' | 'templates'>('index');

  const keyItems = [
    { icon: Circle, label: 'Task', color: 'text-journal-muted' },
    { icon: Check, label: 'Completed', color: 'text-journal-accent' },
    { icon: ArrowRight, label: 'Migrated', color: 'text-journal-yellow' },
    { icon: ArrowLeft, label: 'Scheduled', color: 'text-journal-muted' },
    { icon: Minus, label: 'Note', color: 'text-journal-muted' },
    { icon: Circle, label: 'Event', color: 'text-journal-text', fill: true },
  ];

  const renderLeftPage = () => {
    if (activeRefView === 'stickers') return <StickerPalette />;
    
    return (
      <div className="flex flex-col h-full p-8 space-y-10 select-none">
        {/* BUJO KEY */}
        <section>
          <h3 className="text-[10px] font-bold text-journal-muted uppercase tracking-widest mb-5">The Key</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {keyItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded-lg bg-journal-card border border-black/5 shadow-sm`}>
                  <item.icon className={`w-3 h-3 ${item.color} ${item.fill ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[9px] font-black text-journal-muted uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* INDEX */}
        <section className="flex-1 min-h-0">
          <h3 className="text-[10px] font-bold text-journal-muted uppercase tracking-widest mb-5">The Index</h3>
          <div className="space-y-1">
            {[
              { view: 'dashboard', label: 'Self Journal', icon: TrendingUp },
              { view: 'daily', label: 'Daily Log', icon: List },
              { view: 'library', label: 'Archivist Shelf', icon: History },
              { view: 'habit', label: 'Daily Rituals', icon: Activity },
            ].map((item) => (
              <button 
                key={item.view}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view as any })} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group
                  ${state.activeView === item.view ? 'bg-journal-text text-white shadow-lg' : 'hover:bg-black/5 text-journal-text/60'}
                `}
              >
                <item.icon className={`w-4 h-4 ${state.activeView === item.view ? 'text-white' : 'opacity-40 group-hover:opacity-100'}`} />
                <span className="text-xs font-bold tracking-tight uppercase">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* COMPACT CALENDAR */}
        <section>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Chronos</h3>
           <Calendar />
        </section>

        {/* STREAK INDICATOR */}
        <section className="pt-6 border-t border-black/5">
           <div className="flex items-center justify-between p-4 bg-journal-card rounded-2xl border border-black/5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-journal-text flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4 text-journal-accent" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-journal-text uppercase tracking-widest leading-none">Reflection Streak</span>
                    <span className="text-[9px] font-bold text-journal-accent mt-1">3 Days Consistent</span>
                 </div>
              </div>
              <div className="text-xl font-black text-journal-text">3</div>
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
          transition={{ duration: 0.15 }}
          className="h-full w-full"
        >
          {renderLeftPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpreadController;
