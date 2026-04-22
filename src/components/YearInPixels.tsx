import React from 'react';
import { useJournal } from '../context/JournalContext';

const YearInPixels: React.FC = () => {
  const { state, dispatch } = useJournal();
  const year = new Date().getFullYear();
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const moodColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-400',
    3: 'bg-yellow-400',
    4: 'bg-green-400',
    5: 'bg-purple-500',
  };

  const getDaysInMonth = (month: number) => new Date(year, month + 1, 0).getDate();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Year in Pixels</h1>
        <p className="text-gray-500 font-medium">Your emotional landscape across {year}</p>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <div className="w-10"></div>
          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className="w-6 text-center text-[10px] font-black text-gray-300 uppercase mb-2">
              {i + 1}
            </div>
          ))}
        </div>

        {months.map((month, mIndex) => (
          <div key={month} className="flex gap-2 mb-2 items-center min-w-max">
            <div className="w-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {month}
            </div>
            {Array.from({ length: 31 }).map((_, dIndex) => {
              const daysInMonth = getDaysInMonth(mIndex);
              const day = dIndex + 1;
              const dateStr = `${year}-${String(mIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const mood = state.moods.find(m => m.date === dateStr);
              
              if (day > daysInMonth) return <div key={dIndex} className="w-6 h-6" />;

              return (
                <button
                  key={dIndex}
                  onClick={() => {
                    dispatch({ type: 'SET_DATE', payload: dateStr });
                    dispatch({ type: 'SET_VIEW', payload: 'daily' });
                  }}
                  className={`
                    w-6 h-6 rounded-md transition-all border border-transparent
                    ${mood ? moodColors[mood.mood] : 'bg-gray-100 hover:bg-gray-200'}
                    ${mood ? 'shadow-sm hover:scale-125 hover:z-10 hover:shadow-lg' : ''}
                  `}
                  title={mood ? `Mood: ${mood.mood} on ${dateStr}` : `No entry for ${dateStr}`}
                />
              );
            })}
          </div>
        ))}

        <div className="mt-12 flex justify-center gap-8 border-t border-gray-100 pt-8">
          {[1, 2, 3, 4, 5].map((val) => (
            <div key={val} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-md ${moodColors[val]}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {val === 1 ? 'Awful' : val === 5 ? 'Awesome' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearInPixels;
