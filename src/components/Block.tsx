import React, { useState, useEffect, useRef } from 'react';
import { Block as BlockType, BulletStatus, BlockType as BType } from '../lib/db';
import { useJournal } from '../context/JournalContext';
import { 
  GripVertical, Trash2, Check, X, ArrowRight, ArrowLeft, Minus, Circle, 
  Image as ImageIcon, File as FileIcon, Heading1, Heading2, ListTodo, AlertCircle,
  PenTool, Clock, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CanvasBlock from './CanvasBlock';
import TimerBlock from './TimerBlock';

interface BlockProps {
  block: BlockType;
  dragHandleProps?: any;
}

const Block: React.FC<BlockProps> = ({ block, dragHandleProps }) => {
  const { updateBlock, deleteBlock, navigatetoLink, addBlock } = useJournal();
  const [content, setContent] = useState(block.content);
  const [isFocused, setIsFocused] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    const skipFocus = ['image', 'file', 'canvas', 'timer'].includes(block.type);
    if (block.content === '' && textareaRef.current && !isFocused && !skipFocus) {
      textareaRef.current.focus();
    }
  }, []);

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSlashMenu(false), 200);
    if (content !== block.content) {
      updateBlock({ ...block, content });
    }
  };

  const toggleStatus = () => {
    const statuses: BulletStatus[] = ['todo', 'done', 'migrated', 'scheduled', 'cancelled'];
    const currentIndex = statuses.indexOf(block.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateBlock({ ...block, status: nextStatus });
  };

  const changeType = (type: BType) => {
    updateBlock({ ...block, type, content: content.startsWith('/') ? '' : content });
    setShowSlashMenu(false);
    if (type === 'image' || type === 'file') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateBlock({ ...block, fileData: file, fileName: file.name });
    }
  };

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  const isLocked = block.lockedUntil && new Date(block.lockedUntil) > new Date();

  const renderIcon = () => {
    if (isLocked) return <Lock className="w-4 h-4 text-[#a5a58d]" />;
    
    switch (block.type) {
      case 'heading1': return <Heading1 className="w-4 h-4 text-[#2f3e46]" />;
      case 'heading2': return <Heading2 className="w-4 h-4 text-[#52796f]" />;
      case 'checklist': return (
        <div 
          onClick={toggleStatus}
          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer
            ${block.status === 'done' ? 'bg-[#6b705c] border-[#6b705c]' : 'border-[#a5a58d] hover:border-[#6b705c] bg-white'}
          `}
        >
          {block.status === 'done' && <Check className="w-3 h-3 text-white stroke-[4px]" />}
        </div>
      );
      case 'callout': return <AlertCircle className="w-5 h-5 text-[#6b705c]" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-[#a5a58d]" />;
      case 'file': return <FileIcon className="w-5 h-5 text-[#a5a58d]" />;
      case 'canvas': return <PenTool className="w-5 h-5 text-[#6b705c]" />;
      case 'timer': return <Clock className="w-5 h-5 text-[#6b705c]" />;
      default:
        if (block.type === 'event') return <Circle className="w-3 h-3 text-[#52796f] fill-[#52796f]" />;
        if (block.type === 'note') return <Minus className="w-3 h-3 text-[#a5a58d]" />;
        switch (block.status) {
          case 'done': return <Check className="w-3 h-3 text-[#6b705c] stroke-[3px]" />;
          case 'migrated': return <ArrowRight className="w-3 h-3 text-orange-400 stroke-[3px]" />;
          case 'scheduled': return <ArrowLeft className="w-3 h-3 text-[#52796f] stroke-[3px]" />;
          case 'cancelled': return <X className="w-3 h-3 text-[#a5a58d] stroke-[3px]" />;
          default: return <div className="w-1.5 h-1.5 bg-[#2f3e46] rounded-full" />;
        }
    }
  };

  const renderContent = (text: string) => {
    if (isLocked) return <span className="italic text-[#a5a58d]">This memory is currently sealed...</span>;
    
    return text.split(/(\[\[.*?\]\]|#\w+)/g).map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const target = part.slice(2, -2);
        return (
          <button key={i} onClick={(e) => { e.stopPropagation(); navigatetoLink(target); }} className="text-[#52796f] font-black hover:underline">{target}</button>
        );
      }
      if (part.startsWith('#')) return <span key={i} className="text-[#a5a58d] font-bold">{part}</span>;
      return part;
    });
  };

  const blockTypes: { type: BType; label: string; icon: any }[] = [
    { type: 'task', label: 'Bullet Task', icon: Circle },
    { type: 'checklist', label: 'To-do List', icon: ListTodo },
    { type: 'timer', label: 'Focus Timer', icon: Clock },
    { type: 'canvas', label: 'Sketchpad', icon: PenTool },
    { type: 'heading1', label: 'Big Heading', icon: Heading1 },
    { type: 'heading2', label: 'Medium Heading', icon: Heading2 },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'file', label: 'File Attachment', icon: FileIcon },
    { type: 'callout', label: 'Callout', icon: AlertCircle },
    { type: 'note', label: 'Note', icon: Minus },
  ];

  return (
    <div 
      className={`group relative flex items-start gap-3 py-2 px-4 transition-all rounded-2xl
        ${block.status === 'done' ? 'bg-[#6b705c]/5 opacity-80' : 'hover:bg-black/5'}
        ${block.type.startsWith('heading') ? 'mt-6 mb-2' : ''}
        ${block.type === 'callout' ? 'bg-[#e9edc9]/30 border border-[#e9edc9] p-6 my-4' : ''}
        ${block.type === 'timer' ? 'my-8' : ''}
      `}
      style={{ marginLeft: `${block.indent * 32}px` }}
    >
      <div {...dragHandleProps} className="mt-1.5 p-1 text-[#a5a58d] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-[#6b705c] outline-none" role="button" tabIndex={0}>
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="mt-1.5 flex items-center justify-center w-6 h-6">
        {renderIcon()}
      </div>

      <div className="flex-1 relative min-h-[1.5rem]">
        {block.type === 'canvas' && <CanvasBlock block={block} />}
        {block.type === 'timer' && <TimerBlock block={block} />}

        {block.type === 'image' && block.fileData && (
          <div className="relative group/img mb-4">
            <img 
              src={URL.createObjectURL(block.fileData)} 
              alt={block.fileName} 
              className="max-w-full rounded-2xl shadow-xl border-4 border-white rotate-1"
              style={{ transform: `rotate(${block.rotation || 0}deg)` }}
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
               <button onClick={() => updateBlock({...block, rotation: (block.rotation || 0) + 15})} className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white"><ArrowRight className="w-4 h-4 rotate-45" /></button>
            </div>
          </div>
        )}

        {block.type === 'file' && block.fileData && (
          <div className="flex items-center gap-3 p-4 bg-white border border-[#e0e2db] rounded-2xl shadow-sm mb-4">
            <FileIcon className="w-8 h-8 text-[#a5a58d]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#2f3e46]">{block.fileName}</span>
              <span className="text-[10px] text-[#a5a58d] uppercase font-black">{(block.fileData.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        {(!isFocused && !['image', 'file', 'canvas', 'timer'].includes(block.type)) && (
          <div className={`py-1 px-1 leading-relaxed whitespace-pre-wrap break-words
            ${block.type === 'heading1' ? 'text-3xl font-black tracking-tighter' : ''}
            ${block.type === 'heading2' ? 'text-xl font-bold tracking-tight' : ''}
            ${block.type === 'task' || block.type === 'checklist' ? 'text-sm font-medium' : 'text-sm'}
            ${block.status === 'done' ? 'text-[#52796f] line-through' : 'text-[#2f3e46]'}
          `} onClick={() => setIsFocused(true)}>
            {renderContent(content) || <span className="text-[#a5a58d]/40 italic">...</span>}
          </div>
        )}

        <textarea 
          ref={(el) => { 
            // @ts-ignore
            textareaRef.current = el; 
            adjustHeight(el); 
          }}
          id={`block-${block.id}`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustHeight(e.target as HTMLTextAreaElement);
            if (e.target.value === '/') setShowSlashMenu(true);
            else if (showSlashMenu) setShowSlashMenu(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              updateBlock({ ...block, indent: e.shiftKey ? Math.max(0, block.indent - 1) : Math.min(4, block.indent + 1) });
            }
            if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
              e.preventDefault();
              addBlock(block.logId);
            }
          }}
          placeholder={block.type === 'heading1' ? 'Heading 1' : 'Type / for blocks...'}
          className={`w-full py-1 bg-transparent border-none focus:outline-none rounded px-1 transition-all resize-none overflow-hidden
            ${!isFocused || ['image', 'file', 'canvas', 'timer'].includes(block.type) ? 'absolute inset-0 opacity-0 pointer-events-none' : 'relative z-10'}
            ${block.type === 'heading1' ? 'text-3xl font-black tracking-tighter' : ''}
            ${block.type === 'heading2' ? 'text-xl font-bold tracking-tight' : ''}
            ${block.type === 'task' || block.type === 'checklist' ? 'text-sm font-medium' : 'text-sm'}
            ${block.status === 'done' ? 'text-[#52796f] line-through' : 'text-[#2f3e46]'}
          `}
        />

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

        <AnimatePresence>
          {showSlashMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-full z-[100] mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-black/5 p-2"
            >
              <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest p-3 border-b border-black/5 mb-1">Basic Blocks</div>
              <div className="max-h-64 overflow-auto custom-scrollbar">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => changeType(bt.type)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#6b705c]/10 rounded-2xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-white transition-colors">
                      <bt.icon className="w-4 h-4 text-[#52796f]" />
                    </div>
                    <span className="text-sm font-bold text-[#2f3e46]">{bt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => deleteBlock(block.id)} className="mt-1.5 p-1 text-[#a5a58d] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Block;
