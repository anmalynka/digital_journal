import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PhysicalBook from './PhysicalBook';
import { Sun, Moon } from 'lucide-react';
import { useJournal } from '../context/JournalContext';

const Layout: React.FC = () => {
  const { state, dispatch } = useJournal();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const toggleTheme = () => {
    const next = state.theme === 'dark' ? 'minimal' : 'dark';
    dispatch({ type: 'SET_THEME', payload: next });
  };

  return (
    <div className="min-h-screen w-screen bg-[#f1f3f0] overflow-hidden flex items-center justify-center font-sans selection:bg-[#6b705c]/20">
      {/* The 3D Physical Book Wrapper (V3.0 Dual Spread) */}
      <PhysicalBook>
        <Outlet />
      </PhysicalBook>

      {/* Subtle Global Style Controls */}
      <div className="fixed top-8 right-8 z-[100] flex gap-4">
        <button 
          onClick={toggleTheme}
          className="p-4 bg-white/50 backdrop-blur-xl border border-black/5 text-[#52796f] hover:text-[#2f3e46] hover:bg-white hover:shadow-2xl rounded-3xl transition-all group shadow-sm"
          aria-label="Toggle environment theme"
        >
          {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      {/* Floating Status Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-black/80 backdrop-blur-2xl rounded-full text-[9px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-6 shadow-2xl">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Local Sync Active</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <span>BuJo Pro v3.0.4</span>
         <div className="w-px h-3 bg-white/10" />
         <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default Layout;
