import React, { useState } from 'react';
import { useJournal, JournalView } from '../context/JournalContext';
import { 
  Plus, 
  Info, 
  Trash2, 
  Calendar as CalendarIcon,
  Hash,
  LayoutGrid,
  Search,
  Activity,
  Layers,
  Settings,
  ArrowRight
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
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SEARCH', payload: search });
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollTitle.trim()) {
      await addCollection(newCollTitle);
      setNewCollTitle('');
      setIsAddingColl(false);
    }
  };

  const setView = (view: JournalView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    if (window.innerWidth < 1024) onClose();
  };

  const navItems: { view: JournalView, label: string, icon: any }[] = [
    { view: 'daily', label: 'Daily Log', icon: CalendarIcon },
    { view: 'weekly', label: 'Weekly Overview', icon: Layers },
    { view: 'habit', label: 'Habit Tracker', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-700" role="navigation" aria-label="Main sidebar">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-gray-900 tracking-tight leading-none">BuJo Pro</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">2026 Edition</span>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="relative mb-4 group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            placeholder="Search or #tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm group-hover:border-gray-300"
          />
        </form>

        <nav className="space-y-1">
          {navItems.map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              aria-current={state.activeView === item.view ? 'page' : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${state.activeView === item.view ? 'bg-white text-blue-600 shadow-lg shadow-gray-200/50 border border-gray-100 font-black' : 'hover:bg-gray-100 text-gray-500 font-bold'}
              `}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-8 custom-scrollbar">
        <section aria-label="Calendar navigation">
          <Calendar />
        </section>

        <section aria-labelledby="collections-header">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 id="collections-header" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Running Lists</h3>
            <button 
              onClick={() => setIsAddingColl(true)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Create new collection"
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
                  onClick={() => {
                    dispatch({ type: 'SET_COLLECTION', payload: coll.id });
                    if (window.innerWidth < 1024) onClose();
                  }}
                  aria-current={state.selectedCollectionId === coll.id ? 'page' : undefined}
                  className={`
                    flex-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${state.selectedCollectionId === coll.id ? 'bg-white text-blue-600 shadow-md shadow-gray-200/50 border border-gray-100 font-black' : 'hover:bg-gray-100 text-gray-500 font-bold'}
                  `}
                >
                  <Hash className={`w-4 h-4 ${state.selectedCollectionId === coll.id ? 'text-blue-500' : 'text-gray-300'}`} aria-hidden="true" />
                  <span className="truncate">{coll.title}</span>
                </button>
                <button 
                  onClick={() => deleteCollection(coll.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-opacity focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                  aria-label={`Delete collection ${coll.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {isAddingColl && (
              <form onSubmit={handleAddCollection} className="px-2 pt-2">
                <label htmlFor="new-collection-input" className="sr-only">New collection name</label>
                <input 
                  id="new-collection-input"
                  autoFocus
                  placeholder="Collection name..."
                  value={newCollTitle}
                  onChange={e => setNewCollTitle(e.target.value)}
                  onBlur={() => !newCollTitle && setIsAddingColl(false)}
                  className="w-full px-3 py-2 bg-white border border-blue-500 rounded-xl text-sm focus:outline-none shadow-lg shadow-blue-50"
                />
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
        <button 
          onClick={() => setIsAboutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-black text-gray-500 hover:text-gray-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl hover:bg-gray-50 uppercase tracking-widest"
        >
          <Info className="w-4 h-4 text-gray-400" />
          <span>About System</span>
        </button>
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-black text-gray-500 hover:text-gray-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl hover:bg-gray-50 uppercase tracking-widest"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Preferences</span>
        </button>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default Sidebar;
