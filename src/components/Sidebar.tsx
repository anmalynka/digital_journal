import React, { useState } from 'react';
import { useJournal, JournalView, BookStyle } from '../context/JournalContext';
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
  Share2,
  Heart,
  Book as BookIcon
} from 'lucide-react';
import Calendar from './Calendar';
import AboutModal from './AboutModal';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { state, dispatch, addCollection, deleteCollection } = useJournal();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrefOpen, setIsPrefOpen] = useState(false);
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

  const setBookStyle = (style: BookStyle) => {
    dispatch({ type: 'SET_BOOK_STYLE', payload: style });
  };

  const navItems: { view: JournalView, label: string, icon: any }[] = [
    { view: 'daily', label: 'Daily Log', icon: CalendarIcon },
    { view: 'weekly', label: 'Weekly Overview', icon: Layers },
    { view: 'calendar', label: 'Planner View', icon: LayoutGrid },
    { view: 'habit', label: 'Habit Tracker', icon: Activity },
    { view: 'pixels', label: 'Year in Pixels', icon: Heart },
    { view: 'graph', label: 'Knowledge Graph', icon: Share2 },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent text-[#2f3e46]" role="navigation" aria-label="Main sidebar">
      <div className="p-8 border-b border-black/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#6b705c] rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-[#6b705c]/20 rotate-3">
            <BookIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none">BuJo Pro</span>
            <span className="text-[10px] font-black text-[#52796f] uppercase tracking-widest mt-1 opacity-60">Scribe v2.0</span>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="relative mb-6 group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#52796f] opacity-40 group-focus-within:text-[#6b705c] group-focus-within:opacity-100 transition-all" />
          <input 
            placeholder="Search journal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/5 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b705c]/20 transition-all placeholder-[#52796f]/40"
          />
        </form>

        <nav className="space-y-1.5">
          {navItems.map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              aria-current={state.activeView === item.view ? 'page' : undefined}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all outline-none
                ${state.activeView === item.view ? 'bg-[#6b705c] text-white shadow-xl shadow-[#6b705c]/20 font-bold' : 'hover:bg-black/5 text-[#52796f] font-medium'}
              `}
            >
              <item.icon className={`w-4 h-4 ${state.activeView === item.view ? 'text-white' : 'text-[#a5a58d]'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-10 custom-scrollbar">
        <section aria-label="Calendar navigation">
          <Calendar />
        </section>

        <section aria-labelledby="collections-header">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 id="collections-header" className="text-[11px] font-black text-[#a5a58d] uppercase tracking-[0.2em]">Running Lists</h3>
            <button 
              onClick={() => setIsAddingColl(true)}
              className="p-1.5 text-[#a5a58d] hover:text-[#6b705c] hover:bg-white rounded-xl transition-all shadow-sm border border-black/5"
              aria-label="Create new collection"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
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
                    flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm
                    ${state.selectedCollectionId === coll.id ? 'bg-white text-[#2f3e46] shadow-md font-bold' : 'hover:bg-black/5 text-[#52796f] font-medium'}
                  `}
                >
                  <Hash className={`w-4 h-4 ${state.selectedCollectionId === coll.id ? 'text-[#6b705c]' : 'text-[#a5a58d]/50'}`} aria-hidden="true" />
                  <span className="truncate">{coll.title}</span>
                </button>
                <button 
                  onClick={() => deleteCollection(coll.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#a5a58d] hover:text-red-400 transition-opacity"
                  aria-label={`Delete collection ${coll.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {isAddingColl && (
              <form onSubmit={handleAddCollection} className="px-2 pt-2">
                <input 
                  autoFocus
                  placeholder="List name..."
                  value={newCollTitle}
                  onChange={e => setNewCollTitle(e.target.value)}
                  onBlur={() => !newCollTitle && setIsAddingColl(false)}
                  className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm focus:outline-none shadow-2xl focus:ring-2 focus:ring-[#6b705c]/20"
                />
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="p-8 border-t border-black/5 space-y-3">
        {isPrefOpen && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl border border-black/5 space-y-5 animate-in slide-in-from-bottom-6 duration-500">
            <h4 className="text-[10px] font-black text-[#a5a58d] uppercase tracking-[0.2em] text-center">Aesthetic Style</h4>
            <div className="grid grid-cols-2 gap-3">
              {(['modern', 'minimalist'] as BookStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => setBookStyle(s)}
                  className={`
                    px-3 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all
                    ${state.bookStyle === s ? 'bg-[#6b705c] text-white shadow-xl shadow-[#6b705c]/30' : 'bg-black/5 text-[#52796f] hover:bg-black/10'}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
            <button 
              onClick={() => dispatch({ type: 'SET_BOOK_OPEN', payload: false })}
              className="w-full py-3 bg-[#2f3e46] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/20"
            >
              Close Journal
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
           <button 
            onClick={() => setIsAboutOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-black/5 text-[10px] font-black text-[#52796f] hover:bg-white hover:text-[#2f3e46] hover:shadow-xl hover:shadow-black/5 rounded-2xl transition-all uppercase tracking-widest"
          >
            <Info className="w-4 h-4 opacity-60" />
            <span>Info</span>
          </button>
          <button 
            onClick={() => setIsPrefOpen(!isPrefOpen)}
            className={`
              flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest
              ${isPrefOpen ? 'bg-[#2f3e46] text-white shadow-xl shadow-black/20' : 'bg-black/5 text-[#52796f] hover:bg-white hover:text-[#2f3e46] hover:shadow-xl hover:shadow-black/5'}
            `}
          >
            <Settings className={`w-4 h-4 ${isPrefOpen ? 'text-[#a5a58d]' : 'opacity-60'}`} />
            <span>Style</span>
          </button>
        </div>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default Sidebar;
