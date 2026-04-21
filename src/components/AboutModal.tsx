import React, { useEffect } from 'react';
import { X, Check, ArrowRight, Minus, Circle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      role="presentation"
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 overflow-hidden outline-none"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        tabIndex={-1}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" aria-hidden="true" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="about-modal-title" className="text-3xl font-black text-gray-900 mb-6 tracking-tight">The Bullet Journal® System</h2>
        
        <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
          <p>
            Welcome to your digital **Bullet Journal**. This system is designed to help you track the past, organize the present, and plan for the future using <strong>Rapid Logging</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <section className="p-4 bg-gray-50 rounded-2xl border border-gray-100" aria-labelledby="bullet-types-header">
              <h3 id="bullet-types-header" className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Bullet Types</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full ml-1" aria-hidden="true" />
                  <span><strong>Task</strong>: Actions to take.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-blue-500 fill-blue-500" aria-hidden="true" />
                  <span><strong>Event</strong>: Date-related items.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Minus className="w-3 h-3 text-gray-500" aria-hidden="true" />
                  <span><strong>Note</strong>: Thoughts & facts.</span>
                </li>
              </ul>
            </section>

            <section className="p-4 bg-gray-50 rounded-2xl border border-gray-100" aria-labelledby="task-status-header">
              <h3 id="task-status-header" className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Task Status</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500 stroke-[3px]" aria-hidden="true" />
                  <span><strong>Done</strong>: Completed.</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-orange-500 stroke-[3px]" aria-hidden="true" />
                  <span><strong>Migrated</strong>: Moved forward.</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-3 h-3 text-gray-400 stroke-[3px]" aria-hidden="true" />
                  <span><strong>Cancelled</strong>: No longer relevant.</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Controls</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
              <li>• <strong>Click Icon</strong>: Cycle status</li>
              <li>• <strong>Right Click Icon</strong>: Cycle type</li>
              <li>• <strong>Tab</strong>: Indent (nesting)</li>
              <li>• <strong>Shift + Tab</strong>: Outdent</li>
            </ul>
          </div>

          <p className="text-[10px] text-gray-400 pt-4 text-center font-bold uppercase tracking-widest">
            Crafted with Intent • 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
