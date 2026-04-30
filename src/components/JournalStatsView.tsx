import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ChevronLeft, Calendar, Smile, Frown, Meh, Circle } from 'lucide-react';

const JournalStatsView: React.FC = () => {
  const { dispatch } = useJournal();

  const stats = [
    { label: 'Skipped', value: 8, color: 'bg-journal-text', icon: Circle },
    { label: 'Negative', value: 9, color: 'bg-journal-error', icon: Frown },
    { label: 'Neutral', value: 13, color: 'bg-journal-neutral', icon: Meh },
    { label: 'Positive', value: 21, color: 'bg-journal-accent', icon: Smile },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-8 h-full flex flex-col">
      <header className="flex items-center justify-between mb-12">
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
          className="p-2 -ml-2"
        >
          <ChevronLeft className="w-6 h-6 text-journal-text" />
        </button>
        <button className="p-2">
          <Calendar className="w-5 h-5 text-journal-text" />
        </button>
      </header>

      <div className="mb-12">
        <h1 className="text-3xl font-black text-journal-text mb-1 tracking-tight">Journal Stats</h1>
        <p className="text-xs font-bold text-journal-muted uppercase tracking-widest">Your Journal Stats for Feb 2025</p>
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 pb-20">
        {stats.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full ${item.color} rounded-t-full flex flex-col items-center justify-start pt-6 text-white`}
              style={{ height: `${item.value * 12}px`, minHeight: '100px' }}
            >
              <span className="text-lg font-black mb-1">{item.value}</span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest rotate-0">{item.label}</span>
              
              <div className="mt-auto mb-4 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                <item.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalStatsView;
