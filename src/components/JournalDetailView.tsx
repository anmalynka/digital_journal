import React from 'react';
import { useJournal } from '../context/JournalContext';
import { ChevronLeft, Bell, BookOpen, Clock, Calendar, TrendingDown, AlignLeft } from 'lucide-react';

const JournalDetailView: React.FC = () => {
  const { dispatch } = useJournal();

  const metrics = [
    { icon: AlignLeft, label: 'Words Written', value: '320 words' },
    { icon: Smile, label: 'Mood', value: 'Anxious, Reflective' },
    { icon: Frown, label: 'Emotion', value: 'Overwhelmed' },
    { icon: Clock, label: 'Time Spent', value: '15 minutes' },
    { icon: BookOpen, label: 'Average word count', value: '160' },
    { icon: TrendingDown, label: 'Trend', value: '-10% vs last month', color: 'text-journal-error' },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
          className="p-2 -ml-2"
        >
          <ChevronLeft className="w-6 h-6 text-journal-text" />
        </button>
        <h2 className="text-sm font-bold text-journal-text">Journal Detail</h2>
        <button className="p-2">
          <Bell className="w-5 h-5 text-journal-text" />
        </button>
      </header>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-journal-bg border border-black/5 rounded-2xl mb-6 shadow-sm">
          <BookOpen className="w-6 h-6 text-journal-text" />
        </div>
        <h1 className="text-3xl font-black text-journal-text mb-4 leading-tight tracking-tight px-4">
          Just Got Betrayed By Best Friend
        </h1>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-black text-journal-text">257 Total Words</span>
          <div className="flex items-center gap-4 text-[10px] font-bold text-journal-muted uppercase tracking-widest mt-1">
             <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Friday, Jun 23, 2026</span>
             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 00:13 AM</span>
          </div>
        </div>
      </div>

      <div className="relative mb-12">
        <div className="bg-journal-card rounded-[3rem] p-10 shadow-2xl shadow-black/5 border border-black/5">
          <p className="text-sm font-medium text-journal-muted leading-relaxed text-center">
            You were betrayed by your best friend and now you're feeling depressed
          </p>
        </div>
        {/* Decorative wave background */}
        <div className="absolute -z-10 top-1/2 left-0 right-0 h-40 bg-journal-bg blur-3xl opacity-50" />
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-journal-text uppercase tracking-widest">Key Metrics</h3>
          <button className="text-[10px] font-bold text-journal-muted uppercase tracking-widest">See All</button>
        </div>

        <div className="space-y-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-journal-card border border-black/5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <m.icon className="w-4 h-4 text-journal-muted" />
                </div>
                <span className="text-[11px] font-bold text-journal-muted uppercase tracking-wider">{m.label}</span>
              </div>
              <span className={`text-[11px] font-black ${m.color || 'text-journal-text'} uppercase tracking-wider`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Helper components for icons that might not be in lucide exactly as needed
const Smile = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const Frown = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

export default JournalDetailView;
