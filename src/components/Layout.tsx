import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PhysicalBook from './PhysicalBook';
import { Menu, Sun, Moon } from 'lucide-react';
import { useJournal } from '../context/JournalContext';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state, dispatch } = useJournal();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const toggleTheme = () => {
    const next = state.theme === 'dark' ? 'minimal' : 'dark';
    dispatch({ type: 'SET_THEME', payload: next });
  };

  return (
    <div className="min-h-screen w-screen bg-[#e5e5e5] overflow-hidden">
      {/* Mobile Sidebar Overlay (Only for small screens where book layout might be tight) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* The 3D Physical Book Wrapper */}
      <PhysicalBook 
        sidebar={<Sidebar onClose={() => setIsSidebarOpen(false)} />}
      >
        <div className="h-full w-full overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </PhysicalBook>

      {/* Global Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-4 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-xl rounded-2xl transition-all"
        aria-label="Toggle theme"
      >
        {state.theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
      </button>

      {/* Mobile Menu Trigger (if needed, though PhysicalBook has the sidebar inside) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden p-4 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-400 rounded-2xl"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Layout;
