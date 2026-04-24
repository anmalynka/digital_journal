import React from 'react';
import { motion } from 'framer-motion';
import { useJournal } from '../context/JournalContext';
import { Decoration } from '../lib/db';
import { X } from 'lucide-react';

const DecorationLayer: React.FC = () => {
  const { state, updateDecoration, deleteDecoration } = useJournal();

  const handleDragEnd = (info: any, deco: Decoration) => {
    updateDecoration({
      ...deco,
      x: deco.x + info.offset.x,
      y: deco.y + info.offset.y,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {state.decorations.map((deco) => (
        <motion.div
          key={deco.id}
          drag
          dragMomentum={false}
          onDragEnd={(_e, info) => handleDragEnd(info, deco)}
          initial={{ x: deco.x, y: deco.y, rotate: deco.rotation, scale: deco.scale }}
          className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group"
          style={{ x: deco.x, y: deco.y }}
        >
          {deco.type === 'sticker' && (
            <div className="text-4xl select-none filter drop-shadow-lg group-hover:scale-110 transition-transform">
              {deco.content}
            </div>
          )}
          
          {deco.type === 'tape' && (
            <div 
              className={`w-32 h-6 ${deco.content} rounded-sm shadow-sm border border-white/20 backdrop-blur-[1px]`}
              style={{ transform: `rotate(${deco.rotation}deg)` }}
            />
          )}

          <button
            onClick={() => deleteDecoration(deco.id)}
            className="absolute -top-4 -right-4 bg-white shadow-xl rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default DecorationLayer;
