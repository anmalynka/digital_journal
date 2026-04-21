import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Plus, Calendar as CalendarIcon, List, Clock, TrendingUp } from 'lucide-react';
import Bullet from './Bullet';
import SortableItem from './SortableItem';
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
  const { state, addBullet, reorderBullets } = useJournal();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentLogId = state.selectedCollectionId || state.selectedDate;
  
  const title = useMemo(() => {
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
  }, [state.selectedDate, state.selectedCollectionId, state.collections]);

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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-blue-600 mb-2 font-bold uppercase tracking-wider text-xs">
          {state.selectedCollectionId ? <List className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
          {state.selectedCollectionId ? 'Collection' : 'Daily Log'}
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-6">
          {title}
        </h1>
        
        {!state.selectedCollectionId && stats.total > 0 && (
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Progress
                </span>
                <span className="text-xs font-black text-blue-600">{stats.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
            <div className="text-right border-l border-gray-200 pl-6">
              <div className="text-2xl font-black text-gray-900">{stats.done}/{stats.total}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks Done</div>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-1">
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
          className="group w-full flex items-center gap-3 px-4 py-3 mt-4 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl transition-all"
        >
          <div className="w-5 h-5 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-full group-hover:border-blue-300 transition-colors">
            <Plus className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium">Add to list...</span>
        </button>
      </div>

      {state.bullets.length === 0 && (
        <div className="mt-12 text-center p-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
          <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Your log is empty. Start rapid logging!</p>
        </div>
      )}
    </div>
  );
};

export default MainView;
