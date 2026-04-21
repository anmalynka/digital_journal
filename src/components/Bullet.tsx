import React, { useState, useEffect, useRef } from 'react';
import { Bullet as BulletType, BulletStatus, BulletType as BType } from '../lib/db';
import { useJournal } from '../context/JournalContext';
import { GripVertical, Trash2, Check, X, ArrowRight, ArrowLeft, Minus, Circle } from 'lucide-react';

interface BulletProps {
  bullet: BulletType;
  dragHandleProps?: any;
}

const Bullet: React.FC<BulletProps> = ({ bullet, dragHandleProps }) => {
  const { updateBullet, deleteBullet, dispatch } = useJournal();
  const [content, setContent] = useState(bullet.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(bullet.content);
  }, [bullet.content]);

  useEffect(() => {
    if (bullet.content === '' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleBlur = () => {
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
    if (bullet.type === 'event') return <Circle className="w-3 h-3 text-blue-500 fill-blue-500" />;
    if (bullet.type === 'note') return <Minus className="w-3 h-3 text-gray-500" />;
    
    switch (bullet.status) {
      case 'done': return <Check className="w-3 h-3 text-green-500 stroke-[3px]" />;
      case 'migrated': return <ArrowRight className="w-3 h-3 text-orange-500 stroke-[3px]" />;
      case 'scheduled': return <ArrowLeft className="w-3 h-3 text-purple-500 stroke-[3px]" />;
      case 'cancelled': return <X className="w-3 h-3 text-gray-400 stroke-[3px]" />;
      default: return <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />;
    }
  };

  const renderContentWithTags = (text: string) => {
    return text.split(/(\s+)/).map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <button 
            key={i} 
            onClick={() => dispatch({ type: 'SET_SEARCH', payload: part })}
            className="text-blue-600 font-bold hover:underline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const statusLabel = `Status: ${bullet.status}. Type: ${bullet.type}. Click to cycle status, Right click to cycle type.`;

  return (
    <div 
      className="group relative flex items-start gap-2 py-1 transition-all"
      style={{ marginLeft: `${bullet.indent * 24}px` }}
    >
      <div 
        {...dragHandleProps}
        className="mt-1.5 p-1 text-gray-200 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-gray-400 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500 rounded outline-none"
        aria-label="Drag handle"
        role="button"
        tabIndex={0}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <button 
        onClick={toggleStatus}
        onContextMenu={(e) => { e.preventDefault(); toggleType(); }}
        className={`
          mt-1.5 w-5 h-5 flex items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${bullet.status === 'done' ? 'bg-green-50' : 'hover:bg-gray-100'}
        `}
        aria-label={statusLabel}
        title={statusLabel}
      >
        {getStatusIcon()}
      </button>

      <div className="flex-1 relative">
        <label htmlFor={`bullet-${bullet.id}`} className="sr-only">
          {bullet.type} content
        </label>
        <textarea 
          id={`bullet-${bullet.id}`}
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              if (e.shiftKey) decreaseIndent();
              else increaseIndent();
            }
          }}
          placeholder={bullet.type === 'task' ? 'Add a task...' : bullet.type === 'event' ? 'Add an event...' : 'Add a note...'}
          className={`
            w-full py-1 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white rounded px-1 transition-all text-sm leading-relaxed resize-none overflow-hidden
            ${bullet.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}
            ${bullet.status === 'cancelled' ? 'text-gray-300 line-through' : ''}
            ${bullet.type === 'event' ? 'font-medium' : ''}
          `}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }
          }}
        />
        {/* Read-only view with clickable tags when not focused could be added here for better UX */}
      </div>

      <button 
        onClick={() => deleteBullet(bullet.id)}
        className="mt-1.5 p-1 text-gray-200 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 rounded outline-none"
        aria-label={`Delete ${bullet.type}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Bullet;
