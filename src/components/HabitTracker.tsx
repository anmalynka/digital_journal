import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Trash2, Check, Calendar as CalendarIcon } from 'lucide-react';
import * as db from '../lib/db';

const HabitTracker: React.FC = () => {
  const { state, addHabit, toggleHabit, deleteHabit, dispatch } = useJournal();
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // Generate last 14 days
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  }).reverse();

  useEffect(() => {
    async function loadEntries() {
      const entries = await db.getHabitEntries(days);
      dispatch({ type: 'SET_HABIT_ENTRIES', payload: entries });
    }
    loadEntries();
  }, [state.habits]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      addHabit(newHabitTitle);
      setNewHabitTitle('');
    }
  };

  const isCompleted = (habitId: string, date: string) => {
    return state.habitEntries.some(e => e.habitId === habitId && e.date === date && e.completed);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-[#52796f] mb-4 font-black uppercase tracking-[0.25em] text-[10px] opacity-60">
          <CalendarIcon className="w-4 h-4" /> Habit Consistency
        </div>
        <h1 className="text-5xl font-black text-[#2f3e46] tracking-tight">Daily Rituals</h1>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5">
                <th className="p-6 text-[10px] font-black text-[#2f3e46] uppercase tracking-[0.2em] min-w-[200px]">Ritual</th>
                {days.map(date => (
                  <th key={date} className="p-4 text-[9px] font-black text-[#a5a58d] uppercase tracking-widest text-center opacity-80">
                    {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </th>
                ))}
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {state.habits.map(habit => (
                <tr key={habit.id} className="border-t border-black/5 hover:bg-black/5 transition-colors">
                  <td className="p-6 text-sm font-bold text-[#2f3e46]">{habit.title}</td>
                  {days.map(date => (
                    <td key={date} className="p-2 text-center">
                      <button
                        onClick={() => toggleHabit(habit.id, date, !isCompleted(habit.id, date))}
                        className={`
                          w-8 h-8 rounded-xl flex items-center justify-center transition-all
                          ${isCompleted(habit.id, date) 
                            ? 'bg-[#6b705c] text-white shadow-lg shadow-[#6b705c]/20' 
                            : 'bg-black/5 text-transparent hover:bg-black/10'}
                        `}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                  ))}
                  <td className="p-4">
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-[#a5a58d] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-black/5 border-t border-black/5">
          <form onSubmit={handleAddHabit} className="flex gap-4">
            <input 
              placeholder="New ritual name..."
              value={newHabitTitle}
              onChange={e => setNewHabitTitle(e.target.value)}
              className="flex-1 px-6 py-3 bg-white border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b705c]/20 transition-all shadow-sm"
            />
            <button 
              type="submit"
              className="px-8 py-3 bg-[#2f3e46] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black shadow-lg shadow-black/20 transition-all"
            >
              Add Ritual
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
