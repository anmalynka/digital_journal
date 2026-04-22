import React, { useMemo, useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  Plus, Calendar as CalendarIcon, List, Clock, TrendingUp, Zap, 
  ArrowRightLeft, Sun, Coffee, Sparkles
} from 'lucide-react';
import Bullet from './Bullet';
import SortableItem from './SortableItem';
import HabitTracker from './HabitTracker';
import CalendarPlanner from './CalendarPlanner';
import MigrationWizard from './MigrationWizard';
import YearInPixels from './YearInPixels';
import MoodSelector from './MoodSelector';
import GraphView from './GraphView';
import ZenGarden from './ZenGarden';
import * as db from '../lib/db';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const MainView: React.FC = () => {
  const { state, addBullet, reorderBullets, dispatch, navigatetoLink } = useJournal();
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [weeklyBullets, setWeeklyBullets] = useState<Record<string, any[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentLogId = state.selectedCollectionId || state.selectedDate;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.selectedDate === today && !sessionStorage.getItem('ritualShown')) {
      setIsRitualOpen(true);
      sessionStorage.setItem('ritualShown', 'true');
    }
  }, [state.selectedDate]);

  useEffect(() => {
    if (state.activeView === 'weekly') {
      const loadWeekly = async () => {
        const start = new Date(state.selectedDate);
        start.setDate(start.getDate() - start.getDay());
        const data: Record<string, any[]> = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          data[dateStr] = await db.getBullets(dateStr);
        }
        setWeeklyBullets(data);
      };
      loadWeekly();
    }
  }, [state.activeView, state.selectedDate, state.bullets]);
  
  const title = useMemo(() => {
    if (state.activeView === 'search') return `Search Results for "${state.searchTerm}"`;
    if (state.activeView === 'habit') return 'Habit Tracker';
    if (state.activeView === 'weekly') return 'Weekly Overview';
    if (state.activeView === 'pixels') return 'Year in Pixels';
    if (state.activeView === 'graph') return 'Second Brain Graph';
    if (state.selectedCollectionId) {
      const coll = state.collections.find(c => c.id === state.selectedCollectionId);
      return coll?.title || 'Collection';
    }
    const date = new Date(state.selectedDate);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [state.selectedDate, state.selectedCollectionId, state.collections, state.activeView, state.searchTerm]);

  const stats = useMemo(() => {
    const total = state.bullets.filter(b => b.type === 'task').length;
    const done = state.bullets.filter(b => b.type === 'task' && b.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, progress };
  }, [state.bullets]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = state.bullets.findIndex(b => b.id === active.id);
      const newIndex = state.bullets.findIndex(b => b.id === over.id);
      const newBullets = arrayMove(state.bullets, oldIndex, newIndex);
      await reorderBullets(newBullets);
    }
  };

  if (state.activeView === 'habit') return <HabitTracker />;
  if (state.activeView === 'calendar') return <CalendarPlanner />;
  if (state.activeView === 'pixels') return <YearInPixels />;
  if (state.activeView === 'graph') return <GraphView />;

  return (
    <main className="max-w-4xl mx-auto px-8 py-12 pb-40" aria-labelledby="main-title">
      <header className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#52796f] font-black uppercase tracking-[0.2em] text-[10px] opacity-60">
            {state.selectedCollectionId ? <List className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
            {state.activeView}
          </div>
          <div className="flex gap-2">
            {!state.selectedCollectionId && state.activeView === 'daily' && (
              <button 
                onClick={() => setIsMigrationOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#6b705c]/10 text-[#6b705c] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#6b705c]/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5" /> Migration
              </button>
            )}
          </div>
        </div>
        
        <h1 id="main-title" className="text-5xl font-black text-[#2f3e46] tracking-tight mb-8 leading-tight">
          {title}
        </h1>

        {!state.selectedCollectionId && state.activeView === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <ZenGarden />
            <MoodSelector date={state.selectedDate} />
          </div>
        )}
        
        {!state.selectedCollectionId && state.activeView === 'daily' && stats.total > 0 && (
          <section className="flex items-center gap-8 p-8 bg-black/5 rounded-[2.5rem] border border-black/5 mb-10" aria-label="Daily progress">
            <div className="flex-1">
              <div className="flex justify-between mb-4">
                <span className="text-[10px] font-black text-[#52796f] uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Focus Momentum
                </span>
                <span className="text-xs font-black text-[#6b705c]">{stats.progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-[#6b705c] rounded-full transition-all duration-1000 ease-out shadow-lg shadow-[#6b705c]/20" 
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
            <div className="text-right border-l border-black/10 pl-10">
              <div className="text-4xl font-black text-[#2f3e46] leading-none mb-2">{stats.done}/{stats.total}</div>
              <div className="text-[10px] font-black text-[#52796f] uppercase tracking-widest opacity-60">Completed</div>
            </div>
          </section>
        )}
      </header>

      {state.activeView === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(weeklyBullets).map(([date, bullets]) => (
            <div key={date} className="p-8 bg-black/5 rounded-[2rem] border border-black/5 hover:bg-white hover:shadow-xl transition-all">
              <h3 className="text-[10px] font-black text-[#2f3e46] uppercase tracking-[0.2em] mb-6 border-b border-black/5 pb-3">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
              </h3>
              <div className="space-y-2">
                {bullets.map(b => (
                  <div key={b.id} className="text-sm py-1 flex gap-3 items-start">
                    <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${b.status === 'done' ? 'bg-[#6b705c]' : 'bg-[#a5a58d]'}`} />
                    <span className={b.status === 'done' ? 'line-through text-[#52796f] opacity-50' : 'text-[#2f3e46] font-medium'}>
                      {b.content || 'Untitled'}
                    </span>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    dispatch({ type: 'SET_DATE', payload: date });
                    dispatch({ type: 'SET_VIEW', payload: 'daily' });
                  }}
                  className="w-full text-center mt-6 py-2 text-[10px] font-black text-[#6b705c] uppercase tracking-widest hover:text-[#2f3e46] transition-colors"
                >
                  Edit Log
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="space-y-1" aria-label="Bullet log entries">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={state.bullets.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {state.bullets.map(bullet => (
                <SortableItem key={bullet.id} id={bullet.id}>
                  <Bullet bullet={bullet} />
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <button 
            onClick={() => addBullet(currentLogId)}
            className="group w-full flex items-center gap-4 px-6 py-5 mt-10 text-[#a5a58d] hover:text-[#6b705c] hover:bg-[#6b705c]/5 rounded-[2rem] border-2 border-dashed border-transparent hover:border-[#6b705c]/20 transition-all outline-none"
            aria-label="Add new entry"
          >
            <div className="w-8 h-8 flex items-center justify-center border-2 border-dashed border-[#a5a58d]/40 rounded-full group-hover:border-[#6b705c]/40 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight">Rapid Log Entry...</span>
          </button>
        </section>
      )}

      {state.backlinks.length > 0 && (
        <section className="mt-24 pt-12 border-t border-black/5">
          <h2 className="text-[11px] font-black text-[#a5a58d] uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
            <ArrowRightLeft className="w-4 h-4" /> Connected Synapses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.backlinks.map(link => (
              <button
                key={link.id}
                onClick={() => navigatetoLink(link.sourceId)}
                className="p-6 bg-black/5 rounded-[1.5rem] border border-black/5 text-left hover:bg-white hover:shadow-2xl hover:shadow-[#6b705c]/10 transition-all group"
              >
                <div className="text-[10px] font-black text-[#6b705c] uppercase tracking-widest mb-2">{link.sourceId}</div>
                <div className="text-sm font-bold text-[#2f3e46] group-hover:text-[#6b705c] transition-colors">
                  Referenced in this log
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {state.bullets.length === 0 && state.activeView !== 'weekly' && (
        <div className="mt-24 text-center p-24 bg-black/5 rounded-[4rem] border-4 border-dashed border-black/5">
          <Clock className="w-20 h-20 text-[#a5a58d]/20 mx-auto mb-8" />
          <p className="text-[#a5a58d] font-black tracking-tight uppercase text-xs">Tabula Rasa. Your {state.activeView} is waiting.</p>
        </div>
      )}

      {isMigrationOpen && <MigrationWizard onClose={() => setIsMigrationOpen(false)} />}

      {isRitualOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-[#fdfbf7]/95 backdrop-blur-2xl">
          <div className="max-w-2xl w-full text-center">
            <Sun className="w-20 h-20 text-[#6b705c] mx-auto mb-10 opacity-40 animate-pulse" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-5 h-5 text-[#a5a58d]" />
              <span className="text-[11px] font-black text-[#a5a58d] uppercase tracking-[0.3em]">Quiet Morning</span>
            </div>
            <h2 className="text-6xl font-black text-[#2f3e46] mb-10 tracking-tighter">Quiet your mind.</h2>
            <div className="space-y-8 mb-16">
              <p className="text-2xl font-medium text-[#52796f] leading-relaxed italic opacity-80">"What is one small win you will seek today?"</p>
              <div className="h-0.5 w-24 bg-[#6b705c]/10 mx-auto" />
              <p className="text-[11px] font-black text-[#a5a58d] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                <Sparkles className="w-4 h-4" /> Intentionality is the heart of BuJo
              </p>
            </div>
            <button 
              onClick={() => setIsRitualOpen(false)}
              className="px-16 py-6 bg-[#2f3e46] text-white font-black uppercase tracking-[0.2em] rounded-[2.5rem] hover:bg-black hover:scale-105 transition-all shadow-2xl shadow-[#2f3e46]/30 text-xs"
            >
              Open Logbook
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainView;
