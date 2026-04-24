import React, { useState, useEffect, useRef } from 'react';
import { Block } from '../lib/db';
import { useJournal } from '../context/JournalContext';
import { Play, Pause, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerBlockProps {
  block: Block;
}

const TimerBlock: React.FC<TimerBlockProps> = ({ block }) => {
  const { updateBlock } = useJournal();
  const [timeLeft, setTimeLeft] = useState(block.timerData?.duration || 25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      updateBlock({ 
        ...block, 
        status: 'done', 
        timerData: { duration: 0, completed: true } 
      });
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-8 bg-[#2f3e46] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group/timer border-4 border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 opacity-40">
           <Clock className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deep Work Session</span>
        </div>

        <div className="text-7xl font-black tracking-tighter mb-10 tabular-nums">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={toggleTimer}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-all
              ${isActive ? 'bg-orange-400 shadow-lg shadow-orange-900/40' : 'bg-[#6b705c] shadow-lg shadow-black/40 hover:scale-105'}
            `}
          >
            {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {block.status === 'done' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" /> Session Completed
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TimerBlock;
