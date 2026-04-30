import React, { useMemo, useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  Plus, Calendar as CalendarIcon, List, Clock, TrendingUp, Zap, 
  ArrowRightLeft, Sun, Coffee
} from 'lucide-react';
import Block from './Block';
import SortableItem from './SortableItem';
import HabitTracker from './HabitTracker';
import CalendarPlanner from './CalendarPlanner';
import MigrationWizard from './MigrationWizard';
import YearInPixels from './YearInPixels';
import MoodSelector from './MoodSelector';
import GraphView from './GraphView';
import ZenGarden from './ZenGarden';
import LibraryView from './LibraryView';
import DashboardView from './DashboardView';
import JournalStatsView from './JournalStatsView';
import JournalDetailView from './JournalDetailView';
import OracleView from './OracleView';
import SetupProject from './SetupProject';
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
  const { state, addBlock, reorderBlocks, dispatch, navigatetoLink } = useJournal();
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [weeklyBlocks, setWeeklyBlocks] = useState<Record<string, any[]>>({});

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
          data[dateStr] = await db.getBlocks(dateStr);
        }
        setWeeklyBlocks(data);
      };
      loadWeekly();
    }
  }, [state.activeView, state.selectedDate, state.blocks]);
  
  const title = useMemo(() => {
    if (state.activeView === 'search') return `Search: "${state.searchTerm}"`;
    if (state.activeView === 'habit') return 'Daily Rituals';
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
    if (!state.blocks) return { total: 0, done: 0, progress: 0 };
    const total = state.blocks.filter(b => b.type === 'task').length;
    const done = state.blocks.filter(b => b.type === 'task' && b.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, progress };
  }, [state.blocks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && state.blocks) {
      const oldIndex = state.blocks.findIndex(b => b.id === active.id);
      const newIndex = state.blocks.findIndex(b => b.id === over.id);
      const newBlocks = arrayMove(state.blocks, oldIndex, newIndex);
      await reorderBlocks(newBlocks);
    }
  };

  if (state.activeView === 'habit') return <HabitTracker />;
  if (state.activeView === 'calendar') return <CalendarPlanner />;
  if (state.activeView === 'pixels') return <YearInPixels />;
  if (state.activeView === 'graph') return <GraphView />;
  if (state.activeView === 'library') return <LibraryView />;
  if (state.activeView === 'dashboard') return <DashboardView />;
  if (state.activeView === 'stats') return <JournalStatsView />;
  if (state.activeView === 'detail') return <JournalDetailView />;
  if (state.activeView === 'oracle') return <OracleView />;

  return (
    <main className="max-w-4xl mx-auto px-8 py-12 pb-40" aria-labelledby="main-title">
      {!state.hasCompletedSetup && <SetupProject />}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            {state.selectedCollectionId ? <List className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
            {state.activeView}
          </div>
          <div className="flex gap-2">
            {!state.selectedCollectionId && state.activeView === 'daily' && (
              <button 
                onClick={() => setIsMigrationOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-gray-800"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" /> Migrate
              </button>
            )}
          </div>
        </div>
        
        <h1 id="main-title" className="text-4xl font-black text-black tracking-tighter mb-8 leading-tight">
          {title}
        </h1>

        {!state.selectedCollectionId && state.activeView === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <ZenGarden />
            <MoodSelector date={state.selectedDate} />
          </div>
        )}
        
        {!state.selectedCollectionId && state.activeView === 'daily' && stats.total > 0 && (
          <section className="flex items-center gap-8 p-6 bg-gray-50 border border-gray-100 rounded-lg mb-10" aria-label="Daily progress">
            <div className="flex-1">
              <div className="flex justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-[#166534]" /> Execution Progress
                </span>
                <span className="text-xs font-black text-black">{stats.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#166534] transition-all duration-1000 ease-out" 
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
            <div className="text-right border-l border-gray-200 pl-10">
              <div className="text-3xl font-black text-black leading-none mb-1">{stats.done}/{stats.total}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</div>
            </div>
          </section>
        )}
      </header>

      {state.activeView === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(weeklyBlocks).map(([date, blocks]) => (
            <div key={date} className="p-6 bg-white border border-gray-100 rounded-lg hover:border-black/10 transition-all shadow-sm">
              <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] mb-5 border-b border-gray-100 pb-2">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
              </h3>
              <div className="space-y-1.5">
                {blocks.slice(0, 5).map(b => (
                  <div key={b.id} className="text-xs py-1 flex gap-3 items-start">
                    <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${b.status === 'done' ? 'bg-[#166534]' : 'bg-gray-300'}`} />
                    <span className={b.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}>
                      {b.content || '...'}
                    </span>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    dispatch({ type: 'SET_DATE', payload: date });
                    dispatch({ type: 'SET_VIEW', payload: 'daily' });
                  }}
                  className="w-full text-center mt-4 py-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                >
                  Edit Log
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="space-y-0.5" aria-label="Block log entries">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={state.blocks?.map(b => b.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {state.blocks?.map(block => (
                <SortableItem key={block.id} id={block.id}>
                  <Block block={block} />
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <button 
            onClick={() => addBlock(currentLogId)}
            className="group w-full flex items-center gap-4 px-6 py-4 mt-8 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all border border-dashed border-gray-200 hover:border-gray-300 outline-none"
            aria-label="Add new entry"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Rapid Log Entry</span>
          </button>
        </section>
      )}

      {state.backlinks.length > 0 && (
        <section className="mt-24 pt-12 border-t border-gray-100">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <ArrowRightLeft className="w-4 h-4" /> Connected Synapses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.backlinks.map(link => (
              <button
                key={link.id}
                onClick={() => navigatetoLink(link.sourceId)}
                className="p-5 bg-white border border-gray-100 rounded-lg text-left hover:border-black/20 hover:shadow-lg transition-all group"
              >
                <div className="text-[9px] font-bold text-[#166534] uppercase tracking-widest mb-1">{link.sourceId}</div>
                <div className="text-xs font-bold text-black group-hover:text-[#166534] transition-colors uppercase tracking-tight">
                  Linked here
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {(state.blocks?.length || 0) === 0 && state.activeView !== 'weekly' && (
        <div className="mt-24 text-center p-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
          <Clock className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tabula Rasa. Log your first thought.</p>
        </div>
      )}

      {isMigrationOpen && <MigrationWizard onClose={() => setIsMigrationOpen(false)} />}

      {isRitualOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-white/95 backdrop-blur-sm">
          <div className="max-w-md w-full text-center">
            <Sun className="w-12 h-12 text-gray-300 mx-auto mb-10" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Quiet Session</span>
            </div>
            <h2 className="text-5xl font-black text-black mb-8 tracking-tighter">Focus your intent.</h2>
            <div className="space-y-6 mb-12">
              <p className="text-lg font-medium text-gray-600 leading-relaxed italic">"What is the one thing that must happen today?"</p>
            </div>
            <button 
              onClick={() => setIsRitualOpen(false)}
              className="w-full py-5 bg-black text-white font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-800 transition-all text-[10px] shadow-2xl"
            >
              Begin Daily Log
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainView;
