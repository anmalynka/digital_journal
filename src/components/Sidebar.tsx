import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  Plus, 
   
  Info, 
  Trash2, 
  
  
  Calendar as CalendarIcon,
  Hash,
  LayoutGrid
} from 'lucide-react';
import Calendar from './Calendar';
import AboutModal from './AboutModal';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { state, dispatch, addCollection, deleteCollection } = useJournal();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [newCollTitle, setNewCollTitle] = useState('');
  const [isAddingColl, setIsAddingColl] = useState(false);

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollTitle.trim()) {
      await addCollection(newCollTitle);
      setNewCollTitle('');
      setIsAddingColl(false);
    }
  };

  const selectDailyLog = () => {
    dispatch({ type: 'SET_COLLECTION', payload: null });
    if (window.innerWidth < 1024) onClose();
  };

  const selectCollection = (id: string) => {
    dispatch({ type: 'SET_COLLECTION', payload: id });
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-700">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="font-black text-gray-900 tracking-tight">BuJo PWA</span>
        </div>
        
        <button 
          onClick={selectDailyLog}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
            ${!state.selectedCollectionId ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'hover:bg-gray-100 text-gray-500'}
          `}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm font-bold">Daily Log</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-8 custom-scrollbar">
        <section>
          <Calendar />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collections</h3>
            <button 
              onClick={() => setIsAddingColl(true)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {state.collections.map(coll => (
              <div 
                key={coll.id}
                className="group flex items-center gap-2"
              >
                <button
                  onClick={() => selectCollection(coll.id)}
                  className={`
                    flex-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm
                    ${state.selectedCollectionId === coll.id ? 'bg-white text-blue-600 shadow-sm border border-gray-100 font-bold' : 'hover:bg-gray-100 text-gray-500'}
                  `}
                >
                  <Hash className={`w-4 h-4 ${state.selectedCollectionId === coll.id ? 'text-blue-500' : 'text-gray-300'}`} />
                  <span className="truncate">{coll.title}</span>
                </button>
                <button 
                  onClick={() => deleteCollection(coll.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {isAddingColl && (
              <form onSubmit={handleAddCollection} className="px-2 pt-2">
                <input 
                  autoFocus
                  placeholder="Collection name..."
                  value={newCollTitle}
                  onChange={e => setNewCollTitle(e.target.value)}
                  onBlur={() => !newCollTitle && setIsAddingColl(false)}
                  className="w-full px-3 py-2 bg-white border border-blue-500 rounded-xl text-sm focus:outline-none shadow-lg shadow-blue-50"
                />
              </form>
            )}

            {state.collections.length === 0 && !isAddingColl && (
              <p className="text-[10px] text-gray-400 px-3 italic">No custom collections yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
        <button 
          onClick={() => setIsAboutOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Info className="w-4 h-4 text-gray-400" />
          <span>About BuJo</span>
        </button>
        <span className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">Edition 2026</span>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default Sidebar;
