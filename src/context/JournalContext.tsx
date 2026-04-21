import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as db from '../lib/db';
import { Bullet, Collection, Habit, HabitEntry } from '../lib/db';

export type JournalView = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'habit' | 'search' | 'collection' | 'calendar';

interface JournalState {
  selectedDate: string; // ISO date string 'YYYY-MM-DD'
  selectedCollectionId: string | null;
  activeView: JournalView;
  bullets: Bullet[];
  collections: Collection[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  loading: boolean;
  searchTerm: string;
  theme: string;
}

type JournalAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_COLLECTION'; payload: string | null }
  | { type: 'SET_VIEW'; payload: JournalView }
  | { type: 'SET_BULLETS'; payload: Bullet[] }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_HABIT_ENTRIES'; payload: HabitEntry[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'ADD_BULLET'; payload: Bullet }
  | { type: 'UPDATE_BULLET'; payload: Bullet }
  | { type: 'DELETE_BULLET'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'UPDATE_HABIT_ENTRY'; payload: HabitEntry };

const JournalContext = createContext<{
  state: JournalState;
  dispatch: React.Dispatch<JournalAction>;
  addBullet: (logId: string) => Promise<void>;
  updateBullet: (bullet: Bullet) => Promise<void>;
  deleteBullet: (id: string) => Promise<void>;
  reorderBullets: (bullets: Bullet[]) => Promise<void>;
  addCollection: (title: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string, completed: boolean) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
} | null>(null);

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedCollectionId: null };
    case 'SET_COLLECTION':
      return { ...state, selectedCollectionId: action.payload, activeView: 'collection' };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_BULLETS':
      return { ...state, bullets: action.payload };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'SET_HABIT_ENTRIES':
      return { ...state, habitEntries: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload, activeView: 'search' };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_BULLET':
      return { ...state, bullets: [...state.bullets, action.payload].sort((a, b) => a.order - b.order) };
    case 'UPDATE_BULLET':
      return { ...state, bullets: state.bullets.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BULLET':
      return { ...state, bullets: state.bullets.filter(b => b.id !== action.payload) };
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };
    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter(c => c.id !== action.payload) };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'UPDATE_HABIT_ENTRY':
      const filtered = state.habitEntries.filter(e => !(e.habitId === action.payload.habitId && e.date === action.payload.date));
      return { ...state, habitEntries: [...filtered, action.payload] };
    default:
      return state;
  }
}

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(journalReducer, {
    selectedDate: new Date().toISOString().split('T')[0],
    selectedCollectionId: null,
    activeView: 'daily',
    bullets: [],
    collections: [],
    habits: [],
    habitEntries: [],
    loading: true,
    searchTerm: '',
    theme: 'minimal',
  });

  useEffect(() => {
    async function init() {
      db.initDB();
      const collections = await db.getCollections();
      const habits = await db.getHabits();
      dispatch({ type: 'SET_COLLECTIONS', payload: collections });
      dispatch({ type: 'SET_HABITS', payload: habits });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    init();
  }, []);

  const currentLogId = state.selectedCollectionId || state.selectedDate;

  useEffect(() => {
    async function loadBullets() {
      if (state.activeView === 'search') {
        const all = await db.getAllBullets();
        const filtered = all.filter(b => 
          b.content.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          (b.tags && b.tags.some(t => t.toLowerCase().includes(state.searchTerm.toLowerCase())))
        );
        dispatch({ type: 'SET_BULLETS', payload: filtered });
      } else {
        const bullets = await db.getBullets(currentLogId);
        dispatch({ type: 'SET_BULLETS', payload: bullets });
      }
    }
    if (!state.loading) {
      loadBullets();
    }
  }, [currentLogId, state.loading, state.activeView, state.searchTerm]);

  const addBullet = async (logId: string) => {
    const content = state.searchTerm.startsWith('#') ? state.searchTerm : '';
    const tags = content.match(/#\w+/g)?.map(t => t.slice(1)) || [];
    const newBullet: Bullet = {
      id: crypto.randomUUID(),
      logId,
      content,
      type: 'task',
      status: 'todo',
      order: state.bullets.length,
      indent: 0,
      tags
    };
    await db.saveBullet(newBullet);
    dispatch({ type: 'ADD_BULLET', payload: newBullet });
  };

  const updateBullet = async (bullet: Bullet) => {
    const tags = bullet.content.match(/#\w+/g)?.map(t => t.slice(1)) || [];
    const updated = { ...bullet, tags };
    await db.saveBullet(updated);
    dispatch({ type: 'UPDATE_BULLET', payload: updated });
  };

  const deleteBullet = async (id: string) => {
    await db.deleteBullet(id);
    dispatch({ type: 'DELETE_BULLET', payload: id });
  };

  const reorderBullets = async (bullets: Bullet[]) => {
    const updated = bullets.map((b, i) => ({ ...b, order: i }));
    for (const b of updated) {
      await db.saveBullet(b);
    }
    dispatch({ type: 'SET_BULLETS', payload: updated });
  };

  const addCollection = async (title: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      title,
    };
    await db.saveCollection(newCollection);
    dispatch({ type: 'ADD_COLLECTION', payload: newCollection });
  };

  const deleteCollection = async (id: string) => {
    await db.deleteCollection(id);
    dispatch({ type: 'DELETE_COLLECTION', payload: id });
    if (state.selectedCollectionId === id) {
      dispatch({ type: 'SET_COLLECTION', payload: null });
      dispatch({ type: 'SET_VIEW', payload: 'daily' });
    }
  };

  const addHabit = async (title: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title,
      order: state.habits.length,
      frequency: 'daily'
    };
    await db.saveHabit(newHabit);
    dispatch({ type: 'ADD_HABIT', payload: newHabit });
  };

  const toggleHabit = async (habitId: string, date: string, completed: boolean) => {
    const entry = { habitId, date, completed };
    await db.toggleHabit(habitId, date, completed);
    dispatch({ type: 'UPDATE_HABIT_ENTRY', payload: entry });
  };

  const deleteHabit = async (id: string) => {
    await db.deleteHabit(id);
    dispatch({ type: 'DELETE_HABIT', payload: id });
  };

  return (
    <JournalContext.Provider value={{ 
      state, dispatch, 
      addBullet, updateBullet, deleteBullet, reorderBullets,
      addCollection, deleteCollection,
      addHabit, toggleHabit, deleteHabit
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within JournalProvider');
  return context;
};
