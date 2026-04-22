import React, { useState, useEffect, useRef } from 'react';
import { Bullet as BulletType, BulletStatus, BulletType as BType } from '../lib/db';
import { useJournal } from '../context/JournalContext';
import { GripVertical, Trash2, Check, X, ArrowRight, ArrowLeft, Minus, Circle } from 'lucide-react';

interface BulletProps {
  bullet: BulletType;
  dragHandleProps?: any;
}

const Bullet: React.FC<BulletProps> = ({ bullet, dragHandleProps }) => {
  const { updateBullet, deleteBullet, navigatetoLink } = useJournal();
  const [content, setContent] = useState(bullet.content);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(bullet.content);
  }, [bullet.content]);

  useEffect(() => {
    if (bullet.content === '' && textareaRef.current && !isFocused) {
      textareaRef.current.focus();
    }
  }, []);

  const handleBlur = () => {
    setIsFocused(false);
    if (content !== bullet.content) {
      updateBullet({ ...bullet, content });
    }
  };

  const toggleStatus = () => {
    const statuses: BulletStatus[] = ['todo', 'done', 'migrated', 'scheduled', 'cancelled'];
    const currentIndex = statuses.indexOf(bullet.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateBullet({ ...bullet, status: nextStatus });
  };

  const toggleType = () => {
    const types: BType[] = ['task', 'event', 'note'];
    const currentIndex = types.indexOf(bullet.type);
    const nextType = types[(currentIndex + 1) % types.length];
    updateBullet({ ...bullet, type: nextType });
  };

  const increaseIndent = () => {
    if (bullet.indent < 4) {
      updateBullet({ ...bullet, indent: bullet.indent + 1 });
    }
  };

  const decreaseIndent = () => {
    if (bullet.indent > 0) {
      updateBullet({ ...bullet, indent: bullet.indent - 1 });
    }
  };

  const getStatusIcon = () => {
    if (bullet.type === 'event') return <Circle className="w-3 h-3 text-[#52796f] fill-[#52796f]" />;
    if (bullet.type === 'note') return <Minus className="w-3 h-3 text-[#a5a58d]" />;
    
    switch (bullet.status) {
      case 'done': return <Check className="w-3 h-3 text-[#6b705c] stroke-[3px]" />;
      case 'migrated': return <ArrowRight className="w-3 h-3 text-orange-400 stroke-[3px]" />;
      case 'scheduled': return <ArrowLeft className="w-3 h-3 text-[#52796f] stroke-[3px]" />;
      case 'cancelled': return <X className="w-3 h-3 text-[#a5a58d] stroke-[3px]" />;
      default: return <div className="w-1.5 h-1.5 bg-[#2f3e46] rounded-full" />;
    }
  };

  const renderContent = (text: string) => {
    if (isFocused) return null;
    
    return text.split(/(\[\[.*?\]\]|#\w+)/g).map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const target = part.slice(2, -2);
        return (
          <button 
            key={i} 
            onClick={(e) => { e.stopPropagation(); navigatetoLink(target); }}
            className="text-[#52796f] font-black hover:underline decoration-2 underline-offset-2"
          >
            {target}
          </button>
        );
      }
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-[#a5a58d] font-bold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const statusLabel = `Status: ${bullet.status}. Type: ${bullet.type}. Click to cycle status, Right click to cycle type.`;

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  return (
    <div 
      className={`
        group relative flex items-start gap-3 py-1.5 px-3 transition-all rounded-xl
        ${bullet.status === 'done' ? 'bg-[#6b705c]/5' : 'hover:bg-black/5'}
      `}
      style={{ marginLeft: `${bullet.indent * 32}px` }}
    >
      <div 
        {...dragHandleProps}
        className="mt-1.5 p-1 text-[#a5a58d] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-[#6b705c] focus-visible:opacity-100 outline-none"
        aria-label="Drag handle"
        role="button"
        tabIndex={0}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <button 
        onClick={toggleStatus}
        onContextMenu={(e) => { e.preventDefault(); toggleType(); }}
        className={`
          mt-1.5 w-6 h-6 flex items-center justify-center rounded-xl transition-all outline-none
          ${bullet.status === 'done' ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}
        `}
        aria-label={statusLabel}
        title={statusLabel}
      >
        {getStatusIcon()}
      </button>

      <div className="flex-1 relative min-h-[1.5rem]" onClick={() => setIsFocused(true)}>
        {!isFocused && (
          <div className={`
            py-1 px-1 text-sm leading-relaxed whitespace-pre-wrap break-words
            ${bullet.status === 'done' ? 'text-[#52796f] line-through opacity-50' : 'text-[#2f3e46] font-medium'}
            ${bullet.status === 'cancelled' ? 'text-[#a5a58d] line-through italic' : ''}
            ${bullet.type === 'event' ? 'font-black tracking-tight' : ''}
          `}>
            {renderContent(content) || <span className="text-[#a5a58d]/40 italic">...</span>}
          </div>
        )}
        
        <label htmlFor={`bullet-${bullet.id}`} className="sr-only">
          {bullet.type} content
        </label>
        <textarea 
          id={`bullet-${bullet.id}`}
          ref={(el) => {
            // @ts-ignore
            textareaRef.current = el;
            adjustHeight(el);
          }}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustHeight(e.target as HTMLTextAreaElement);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              if (e.shiftKey) decreaseIndent();
              else increaseIndent();
            }
          }}
          placeholder={bullet.type === 'task' ? 'Action item...' : bullet.type === 'event' ? 'Event/Date...' : 'Reflection...'}
          className={`
            w-full py-1 bg-transparent border-none focus:outline-none rounded px-1 transition-all text-sm leading-relaxed resize-none overflow-hidden
            ${!isFocused ? 'absolute inset-0 opacity-0 pointer-events-none' : 'relative z-10'}
            ${bullet.status === 'done' ? 'text-[#52796f] line-through opacity-50' : 'text-[#2f3e46] font-medium'}
          `}
        />
      </div>

      <button 
        onClick={() => deleteBullet(bullet.id)}
        className="mt-1.5 p-1 text-[#a5a58d] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity outline-none"
        aria-label={`Delete ${bullet.type}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Bullet;
