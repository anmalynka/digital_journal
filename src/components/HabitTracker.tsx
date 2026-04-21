import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Plus, Trash2, Check, X, Calendar as CalendarIcon } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-blue-600 mb-2 font-bold uppercase tracking-wider text-xs">
          <CalendarIcon className="w-3.5 h-3.5" /> Habit Tracker
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Consistency is Key</h1>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[200px]">Habit</th>
                {days.map(date => (
                  <th key={date} className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </th>
                ))}
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {state.habits.map(habit => (
                <tr key={habit.id} className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-700">{habit.title}</td>
                  {days.map(date => (
                    <td key={date} className="p-2 text-center">
                      <button
                        onClick={() => toggleHabit(habit.id, date, !isCompleted(habit.id, date))}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center transition-all
                          ${isCompleted(habit.id, date) 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                            : 'bg-gray-100 text-transparent hover:bg-gray-200'}
                        `}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                  ))}
                  <td className="p-4">
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <form onSubmit={handleAddHabit} className="flex gap-4">
            <input 
              placeholder="New habit name..."
              value={newHabitTitle}
              onChange={e => setNewHabitTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              Add Habit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
