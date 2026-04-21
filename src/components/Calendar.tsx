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
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-400 uppercase text-center">
            {d[0]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-lg transition-all
                ${isSelected(day) ? 'bg-blue-600 text-white font-bold scale-110 shadow-md' : 'hover:bg-blue-50 text-gray-600'}
                ${isToday(day) && !isSelected(day) ? 'border border-blue-200 text-blue-600 font-bold' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
