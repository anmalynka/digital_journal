import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
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
    <div className="flex h-screen w-screen bg-white text-gray-900 overflow-hidden dark:bg-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-gray-200 lg:hidden bg-white">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              aria-label="Open sidebar navigation"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-4 font-bold text-gray-900">BuJo Pro</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Toggle theme"
          >
            {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Desktop Theme Toggle Floating */}
        <button 
          onClick={toggleTheme}
          className="hidden lg:flex fixed top-6 right-6 z-50 p-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 rounded-2xl transition-all"
          aria-label="Toggle theme"
        >
          {state.theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
        </button>

        <div className="flex-1 overflow-auto bg-white custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
