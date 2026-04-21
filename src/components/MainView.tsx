import React, { useMemo, useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Plus, Calendar as CalendarIcon, List, Clock, TrendingUp, Search as SearchIcon, Tag, Zap } from 'lucide-react';
import Bullet from './Bullet';
import SortableItem from './SortableItem';
import HabitTracker from './HabitTracker';
import MigrationWizard from './MigrationWizard';
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
  const { state, addBullet, reorderBullets, dispatch } = useJournal();
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [weeklyBullets, setWeeklyBullets] = useState<Record<string, any[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentLogId = state.selectedCollectionId || state.selectedDate;

  // Load weekly bullets if needed
  useEffect(() => {
    if (state.activeView === 'weekly') {
      const loadWeekly = async () => {
        const start = new Date(state.selectedDate);
        start.setDate(start.getDate() - start.getDay()); // Sunday
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

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 pb-32" aria-labelledby="main-title">
      <header className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
            {state.selectedCollectionId ? <List className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
            {state.activeView}
          </div>
          {!state.selectedCollectionId && state.activeView === 'daily' && (
            <button 
              onClick={() => setIsMigrationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
            >
              <Zap className="w-3.5 h-3.5" /> Migration Wizard
            </button>
          )}
        </div>
        <h1 id="main-title" className="text-4xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
          {title}
        </h1>
        
        {!state.selectedCollectionId && state.activeView === 'daily' && stats.total > 0 && (
          <section className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100" aria-label="Daily progress">
            <div className="flex-1">
              <div className="flex justify-between mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Focus Progress
                </span>
                <span className="text-xs font-black text-blue-600">{stats.progress}%</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-lg shadow-blue-100" 
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
            <div className="text-right border-l border-gray-200 pl-8">
              <div className="text-3xl font-black text-gray-900 leading-none mb-1">{stats.done}/{stats.total}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks Done</div>
            </div>
          </section>
        )}
      </header>

      {state.activeView === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(weeklyBullets).map(([date, bullets]) => (
            <div key={date} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
              </h3>
              <div className="space-y-1">
                {bullets.map(b => (
                  <div key={b.id} className="text-sm py-1 flex gap-2 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0" />
                    <span className={b.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}>
                      {b.content}
                    </span>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    dispatch({ type: 'SET_DATE', payload: date });
                    dispatch({ type: 'SET_VIEW', payload: 'daily' });
                  }}
                  className="w-full text-center py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Edit Full Log
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
            className="group w-full flex items-center gap-3 px-4 py-4 mt-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl border-2 border-dashed border-transparent hover:border-blue-100 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Add new entry"
          >
            <div className="w-6 h-6 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-full group-hover:border-blue-300 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">New Bullet Entry...</span>
          </button>
        </section>
      )}

      {state.bullets.length === 0 && state.activeView !== 'weekly' && (
        <div className="mt-20 text-center p-20 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100/50">
          <Clock className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <p className="text-gray-400 font-bold tracking-tight">Your {state.activeView} log is currently a blank canvas.</p>
        </div>
      )}

      {isMigrationOpen && <MigrationWizard onClose={() => setIsMigrationOpen(false)} />}
    </main>
  );
};

export default MainView;
