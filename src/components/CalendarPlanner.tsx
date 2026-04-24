import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import * as db from '../lib/db';

const CalendarPlanner: React.FC = () => {
  const { state, dispatch } = useJournal();
  const [viewDate, setViewDate] = useState(new Date(state.selectedDate));
  const [monthData, setMonthData] = useState<Record<string, any[]>>({});

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  useEffect(() => {
    async function loadMonth() {
      const data: Record<string, any[]> = {};
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dateStr = d.toISOString().split('T')[0];
        data[dateStr] = await db.getBlocks(dateStr);
      }
      setMonthData(data);
    }
    loadMonth();
  }, [viewDate]);

  const selectDate = (date: string) => {
    dispatch({ type: 'SET_DATE', payload: date });
    dispatch({ type: 'SET_VIEW', payload: 'daily' });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2 font-bold uppercase tracking-wider text-xs">
            <CalendarIcon className="w-3.5 h-3.5" /> Planner View
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-gray-50 p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white/50 h-40" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const d = new Date(year, month, day);
          const dateStr = d.toISOString().split('T')[0];
          const blocks = monthData[dateStr] || [];
          const tasks = blocks.filter(b => b.type === 'task');
          const done = tasks.filter(b => b.status === 'done').length;
          
          return (
            <button
              key={day}
              onClick={() => selectDate(dateStr)}
              className="bg-white h-40 p-4 hover:bg-blue-50/30 transition-all text-left group flex flex-col"
            >
              <span className={`
                text-sm font-black mb-2 w-8 h-8 flex items-center justify-center rounded-xl transition-all
                ${dateStr === new Date().toISOString().split('T')[0] ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-900 group-hover:text-blue-600'}
              `}>
                {day}
              </span>
              <div className="flex-1 overflow-hidden space-y-1">
                {blocks.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 truncate">
                    {b.status === 'done' ? <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> : <Circle className="w-2.5 h-2.5" />}
                    <span className={b.status === 'done' ? 'line-through opacity-50' : ''}>{b.content || 'Untitled'}</span>
                  </div>
                ))}
                {blocks.length > 3 && (
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">+{blocks.length - 3} more</div>
                )}
              </div>
              {tasks.length > 0 && (
                <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(done / tasks.length) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPlanner;
