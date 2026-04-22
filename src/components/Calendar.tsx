import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar: React.FC = () => {
  const { state, dispatch } = useJournal();
  const [viewDate, setViewDate] = useState(new Date(state.selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDate = (day: number) => {
    const selected = new Date(year, month, day);
    const dateStr = selected.toISOString().split('T')[0];
    dispatch({ type: 'SET_DATE', payload: dateStr });
  };

  const isSelected = (day: number) => {
    const d = new Date(year, month, day).toISOString().split('T')[0];
    return d === state.selectedDate;
  };

  const isToday = (day: number) => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date(year, month, day).toISOString().split('T')[0];
    return d === today;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <nav className="p-4 bg-white/50 rounded-2xl border border-black/5" aria-label="Daily log navigation">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black text-[#2f3e46] uppercase tracking-widest" aria-live="polite">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button 
            onClick={prevMonth} 
            className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-black/5"
            aria-label={`Go to ${monthNames[month === 0 ? 11 : month - 1]}`}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#52796f]" />
          </button>
          <button 
            onClick={nextMonth} 
            className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-black/5"
            aria-label={`Go to ${monthNames[month === 11 ? 0 : month + 1]}`}
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#52796f]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[9px] font-black text-[#a5a58d] uppercase text-center opacity-60" aria-hidden="true">
            {d[0]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} role="gridcell" />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              role="gridcell"
              aria-pressed={isSelected(day)}
              className={`
                aspect-square flex items-center justify-center text-[10px] font-black rounded-lg transition-all outline-none
                ${isSelected(day) ? 'bg-[#6b705c] text-white shadow-lg' : 'hover:bg-white text-[#52796f]'}
                ${isToday(day) && !isSelected(day) ? 'bg-[#e9edc9] text-[#6b705c]' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Calendar;
