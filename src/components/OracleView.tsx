import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, RefreshCcw, PenTool } from 'lucide-react';
import { useJournal } from '../context/JournalContext';

const OracleView: React.FC = () => {
  const { dispatch } = useJournal();
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  const prompts = [
    "What is a small win from today that you're underestimating?",
    "If today was a chapter in a book, what would its title be?",
    "What is one thing you're holding onto that you need to let go of?",
    "Describe a moment today when you felt completely at peace.",
    "What would your future self from 5 years ago say about your current life?",
    "Who is someone you're grateful for today, and why?",
    "What is a fear you faced recently, even a small one?",
    "If you had 2 extra hours today, how would you have spent them?"
  ];

  const drawCard = () => {
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(random);
  };


  return (
    <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 text-[#6b705c] mb-4 font-black uppercase tracking-[0.3em] text-[10px]">
          <HelpCircle className="w-4 h-4" /> The Reflective Oracle
        </div>
        <h1 className="text-5xl font-black text-[#2f3e46] tracking-tighter">Seek Internal Guidance</h1>
      </div>

      <AnimatePresence mode="wait">
        {!currentPrompt ? (
          <motion.div 
            key="deck"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="relative w-64 h-96"
          >
            {/* 3D Stack Effect */}
            <div className="absolute inset-0 bg-[#2f3e46] rounded-[2rem] shadow-2xl translate-x-4 translate-y-4 opacity-20" />
            <div className="absolute inset-0 bg-[#2f3e46] rounded-[2rem] shadow-2xl translate-x-2 translate-y-2 opacity-40" />
            <button 
              onClick={drawCard}
              className="absolute inset-0 bg-[#2f3e46] rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-8 group overflow-hidden border-4 border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <Sparkles className="w-12 h-12 text-yellow-400 mb-6 group-hover:scale-125 transition-transform" />
              <span className="text-sm font-black text-white uppercase tracking-[0.4em]">Draw Reflection</span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="prompt"
            initial={{ y: 50, opacity: 0, rotateY: 90 }}
            animate={{ y: 0, opacity: 1, rotateY: 0 }}
            className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-black/5 relative"
          >
            <div className="text-4xl text-[#6b705c] mb-8 opacity-20">“</div>
            <p className="text-2xl font-bold text-[#2f3e46] leading-relaxed mb-12 italic">
              {currentPrompt}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={drawCard}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-black/5 text-[#52796f] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black/10 transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> New Card
              </button>
              <button 
                onClick={() => {
                   dispatch({ type: 'SET_VIEW', payload: 'daily' });
                }}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#6b705c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#6b705c]/30 hover:scale-105 transition-all"
              >
                <PenTool className="w-4 h-4" /> Journal It
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OracleView;
