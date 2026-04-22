import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Smile, Meh, Frown, Star, Zap } from 'lucide-react';

const MoodSelector: React.FC<{ date: string }> = ({ date }) => {
  const { state, saveMood } = useJournal();
  const currentMood = state.moods.find(m => m.date === date);

  const moods = [
    { value: 1, icon: Frown, color: 'text-red-500', label: 'Awful' },
    { value: 2, icon: Meh, color: 'text-orange-400', label: 'Bad' },
    { value: 3, icon: Smile, color: 'text-yellow-400', label: 'Okay' },
    { value: 4, icon: Star, color: 'text-green-400', label: 'Great' },
    { value: 5, icon: Zap, color: 'text-purple-500', label: 'Awesome' },
  ];

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Daily Mood</span>
      <div className="flex gap-2">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => saveMood({ date, mood: m.value, energy: currentMood?.energy || 3 })}
            className={`
              p-2 rounded-xl transition-all
              ${currentMood?.mood === m.value 
                ? 'bg-white shadow-lg scale-125 ring-2 ring-blue-100' 
                : 'hover:bg-white hover:shadow-sm grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}
            `}
            title={m.label}
          >
            <m.icon className={`w-5 h-5 ${m.color}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
