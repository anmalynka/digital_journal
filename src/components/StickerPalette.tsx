import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Star, Heart, Sparkles, Sun, Zap, Coffee } from 'lucide-react';

const StickerPalette: React.FC = () => {
  const { addDecoration } = useJournal();

  const stickers = [
    { type: 'sticker' as const, content: '⭐', icon: Star, color: 'text-yellow-400' },
    { type: 'sticker' as const, content: '❤️', icon: Heart, color: 'text-red-400' },
    { type: 'sticker' as const, content: '✨', icon: Sparkles, color: 'text-blue-400' },
    { type: 'sticker' as const, content: '☀️', icon: Sun, color: 'text-orange-400' },
    { type: 'sticker' as const, content: '☕', icon: Coffee, color: 'text-[#6f4e37]' },
    { type: 'sticker' as const, content: '⚡', icon: Zap, color: 'text-purple-400' },
    { type: 'tape' as const, content: 'bg-[#e9edc9]/60', label: 'Sage Tape' },
    { type: 'tape' as const, content: 'bg-[#faedcd]/60', label: 'Sand Tape' },
    { type: 'tape' as const, content: 'bg-[#dbeafe]/60', label: 'Sky Tape' },
  ];

  const handleAdd = (s: any) => {
    addDecoration({
      type: s.type,
      content: s.content,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      rotation: Math.random() * 20 - 10,
      scale: 1,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <section>
        <h3 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] mb-6">Digital Stickers</h3>
        <div className="grid grid-cols-4 gap-3">
          {stickers.filter(s => s.type === 'sticker').map((s, i) => (
            <button
              key={i}
              onClick={() => handleAdd(s)}
              className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all"
            >
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] mb-6">Washi Tape</h3>
        <div className="space-y-3">
          {stickers.filter(s => s.type === 'tape').map((s, i) => (
            <button
              key={i}
              onClick={() => handleAdd(s)}
              className={`w-full h-8 ${s.content} rounded-lg border border-white/20 shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center text-[8px] font-black uppercase tracking-widest text-black/20`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <div className="p-6 bg-[#6b705c]/5 rounded-[2rem] border border-[#6b705c]/10 mt-auto text-center">
         <p className="text-[9px] font-black text-[#6b705c] uppercase tracking-widest leading-loose">
           Scrapbook Mode<br/>Drag stickers to position<br/>persistent across reloads
         </p>
      </div>
    </div>
  );
};

export default StickerPalette;
