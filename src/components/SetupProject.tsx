import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJournal } from '../context/JournalContext';
import { Book, ArrowRight, Target, Key } from 'lucide-react';

const SetupProject: React.FC = () => {
  const { dispatch } = useJournal();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to your Methodical Journal",
      desc: "Based on the original Bullet Journal method by Ryder Carroll. We've stripped away the digital noise to give you a focused space for intentional living.",
      icon: Book,
      color: "text-[#6b705c]"
    },
    {
      title: "The Core Key",
      desc: "Standard signifiers are built-in: • for Tasks, X for Completed, > for Migrated, and - for Notes. These help you scan your log in seconds.",
      icon: Key,
      color: "text-orange-400"
    },
    {
      title: "Intentional Migration",
      desc: "Every day is a fresh start. Use the Migration Wizard to consciously move unfinished tasks forward or let them go. Nothing is lost, only moved.",
      icon: Target,
      color: "text-[#52796f]"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else dispatch({ type: 'COMPLETE_SETUP' });
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-[#f1f3f0] flex items-center justify-center p-8">
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md w-full bg-white rounded-xl shadow-2xl p-10 text-center border border-black/5"
      >
        <div className={`w-20 h-20 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-8 ${current.color}`}>
          <current.icon className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-black text-[#2f3e46] tracking-tighter mb-4">{current.title}</h2>
        <p className="text-sm text-[#52796f] leading-relaxed mb-10">{current.desc}</p>

        <div className="flex gap-4">
           {step > 0 && (
             <button 
               onClick={() => setStep(step - 1)}
               className="flex-1 py-4 bg-black/5 text-[#52796f] rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-black/10 transition-all"
             >
               Back
             </button>
           )}
           <button 
             onClick={handleNext}
             className="flex-1 py-4 bg-[#6b705c] text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#6b705c]/30 hover:bg-black transition-all flex items-center justify-center gap-2"
           >
             {step < steps.length - 1 ? "Next" : "Initialize Journal"}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
           {steps.map((_, i) => (
             <div key={i} className={`h-1 w-8 rounded-full transition-all ${i === step ? 'bg-[#6b705c]' : 'bg-black/10'}`} />
           ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SetupProject;
