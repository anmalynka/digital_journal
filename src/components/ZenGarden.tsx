import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Sprout, Flower, Wind, CloudRain } from 'lucide-react';

const ZenGarden: React.FC = () => {
  const { state } = useJournal();

  const streak = useMemo(() => {
    // Very simple streak calculation: how many consecutive days with at least one block
    // For a real app, this would be a more complex query
    return Math.min(10, (state.blocks?.length || 0) > 0 ? 3 : 0); // Placeholder for now
  }, [state.blocks]);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 z-10">
        <Sprout className="w-4 h-4 text-green-500" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Sanctuary</span>
      </div>

      <div className="relative w-32 h-32 mb-4 z-10 flex items-center justify-center">
        {/* Animated SVG Garden */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {/* Ground */}
          <path d="M20 80 Q50 75 80 80" stroke="#e5e7eb" strokeWidth="2" fill="none" />
          
          {/* Trunk */}
          <path 
            d="M50 80 L50 60" 
            stroke="#92400e" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="transition-all duration-1000"
            style={{ transform: `scale(${1 + streak * 0.1})`, transformOrigin: 'bottom' }}
          />

          {/* Leaves */}
          {Array.from({ length: Math.max(1, streak) }).map((_, i) => (
            <circle 
              key={i}
              cx={50 + (Math.sin(i) * 15)} 
              cy={55 - (i * 5)} 
              r={4 + (i % 3)} 
              fill={i % 2 === 0 ? '#22c55e' : '#4ade80'} 
              className="animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}

          {streak > 5 && (
            <Flower className="w-4 h-4 text-pink-400" x="42" y="30" />
          )}
        </svg>
      </div>

      <div className="text-center z-10">
        <div className="text-sm font-black text-gray-900 mb-1">Level {streak} Haven</div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
          {streak === 0 ? 'Plant a seed by logging today' : 'Your garden is thriving'}
        </p>
      </div>

      {/* Floating elements */}
      <Wind className="absolute top-4 right-4 w-4 h-4 text-blue-100 group-hover:translate-x-2 transition-transform duration-1000" />
      <CloudRain className="absolute top-8 left-4 w-4 h-4 text-blue-100 group-hover:translate-y-2 transition-transform duration-1000" />
    </div>
  );
};

export default ZenGarden;
