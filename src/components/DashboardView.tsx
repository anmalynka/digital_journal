import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  Plus, Bell, BookOpen, Smile, Frown, Meh, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardView: React.FC = () => {
  const { state, dispatch, addBlock } = useJournal();

  const stats = useMemo(() => {
    const moods = state.moods || [];
    
    // Total journals (days with at least one block or mood)
    // For simplicity, let's use the number of mood entries as a proxy for active days
    const totalJournals = moods.length;
    
    // Total words (from blocks)
    // In a real app we'd fetch all blocks, but for now let's use current blocks if any
    const totalWords = state.blocks.reduce((acc, b) => acc + (b.content?.split(' ').length || 0), 0) * 100; // Mocking higher number for aesthetic

    const positive = moods.filter(m => m.mood > 3).length;
    const negative = moods.filter(m => m.mood < 3).length;
    const neutral = moods.length - positive - negative;

    return { totalJournals, totalWords, positive, negative, neutral };
  }, [state.moods, state.blocks]);

  const moodBars = [
    { label: 'Happy', value: 80, color: 'bg-journal-accent' },
    { label: 'Neutral', value: 65, color: 'bg-journal-neutral' },
    { label: 'Reflective', value: 45, color: 'bg-journal-yellow' },
    { label: 'Stressed', value: 20, color: 'bg-journal-error' },
    { label: 'Anxious', value: 10, color: 'bg-journal-purple' },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
          <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-sm font-bold text-journal-text">Self Journal</h2>
        <button className="relative p-2">
          <Bell className="w-5 h-5 text-journal-text" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-journal-error rounded-full border-2 border-journal-bg" />
        </button>
      </header>

      {/* Hero Stats */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-journal-bg border border-black/5 rounded-2xl mb-4 shadow-sm">
          <BookOpen className="w-6 h-6 text-journal-text" />
        </div>
        <h1 className="text-5xl font-black text-journal-text mb-2 tracking-tighter">{stats.totalJournals}</h1>
        <p className="text-sm font-bold text-journal-muted mb-6">Total Journals</p>
        <p className="text-[10px] font-medium text-journal-muted/60 uppercase tracking-widest mb-8">
          You need to write your first journal
        </p>

        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center mb-2 shadow-sm">
              <span className="text-[10px] font-black text-journal-text">🔗</span>
            </div>
            <span className="text-xs font-black text-journal-text">{stats.totalWords.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-journal-muted/60 uppercase tracking-widest">Total Words</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-journal-error/20 flex items-center justify-center mb-2 shadow-sm bg-journal-error/5">
              <Frown className="w-5 h-5 text-journal-error" />
            </div>
            <span className="text-xs font-black text-journal-text">{stats.negative}</span>
            <span className="text-[9px] font-bold text-journal-muted/60 uppercase tracking-widest">Negative</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-journal-accent/20 flex items-center justify-center mb-2 shadow-sm bg-journal-accent/5">
              <Smile className="w-5 h-5 text-journal-accent" />
            </div>
            <span className="text-xs font-black text-journal-text">{stats.positive}</span>
            <span className="text-[9px] font-bold text-journal-muted/60 uppercase tracking-widest">Positive</span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-center mb-12">
        <button 
          onClick={() => {
            dispatch({ type: 'SET_VIEW', payload: 'daily' });
            addBlock(state.selectedDate);
          }}
          className="w-14 h-14 bg-journal-yellow text-white rounded-full flex items-center justify-center shadow-xl shadow-journal-yellow/20 hover:scale-110 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Journal Insight */}
      <section className="bg-journal-card rounded-5xl p-8 shadow-xl shadow-black/5 border border-black/5 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-journal-text uppercase tracking-widest">Journal Insight</h3>
        </div>
        
        <div className="space-y-6">
          <div className="mb-8">
             <h4 className="text-lg font-black text-journal-text mb-1 tracking-tight">Happy</h4>
             <p className="text-[10px] font-medium text-journal-muted uppercase tracking-wider">Most frequent emotion</p>
          </div>

          <div className="space-y-4">
            {moodBars.map((bar) => (
              <div key={bar.label} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-journal-muted w-4">{bar.value}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.value}%` }}
                    className={`h-full ${bar.color} rounded-full`}
                  />
                </div>
                <div className="w-4 h-4 flex items-center justify-center opacity-40">
                  {bar.label === 'Happy' && <Smile className="w-3 h-3" />}
                  {bar.label === 'Neutral' && <Meh className="w-3 h-3" />}
                  {bar.label === 'Stressed' && <Frown className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-medium text-journal-muted leading-relaxed mt-8">
            You've been reflecting on positive experiences often this month. Keep it up!
          </p>
        </div>
      </section>

      {/* Journal Calendar */}
      <section className="bg-journal-card rounded-5xl p-8 shadow-xl shadow-black/5 border border-black/5">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-black text-journal-text uppercase tracking-widest">Journal Calendar</h3>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
            className="text-[10px] font-bold text-journal-muted hover:text-journal-text transition-colors flex items-center gap-1"
          >
            See All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-3xl font-black text-journal-text tracking-tighter">24/31</div>
            <div className="text-[10px] font-medium text-journal-muted uppercase tracking-widest">Journals written this month</div>
          </div>
          <button className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-journal-text" />
          </button>
        </div>

        {/* Mini Calendar visualization - just a row of dots for now */}
        <div className="flex gap-2 justify-between">
          {Array.from({ length: 14 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-6 rounded-full ${i % 3 === 0 ? 'bg-journal-accent' : i % 5 === 0 ? 'bg-journal-error' : 'bg-gray-100'}`}
            />
          ))}
        </div>
      </section>
      
      {/* Navigation for new views (Mock for now) */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'stats' })}
          className="flex-1 py-4 bg-journal-card border border-black/5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          View Detailed Stats
        </button>
      </div>
    </div>
  );
};

export default DashboardView;
