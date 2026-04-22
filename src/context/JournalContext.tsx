import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as db from '../lib/db';
import { Bullet, Collection, Habit, HabitEntry, JournalLink, DayMood } from '../lib/db';

export type JournalView = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'habit' | 'search' | 'collection' | 'calendar' | 'graph' | 'pixels';
export type BookStyle = 'modern' | 'minimalist';

interface JournalState {
  selectedDate: string; // ISO date string 'YYYY-MM-DD'
  selectedCollectionId: string | null;
  activeView: JournalView;
  bookStyle: BookStyle;
  isBookOpen: boolean;
  bullets: Bullet[];
  collections: Collection[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  links: JournalLink[];
  backlinks: JournalLink[];
  moods: DayMood[];
  loading: boolean;
  searchTerm: string;
  theme: string;
}

type JournalAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_COLLECTION'; payload: string | null }
  | { type: 'SET_VIEW'; payload: JournalView }
  | { type: 'SET_BOOK_STYLE'; payload: BookStyle }
  | { type: 'SET_BOOK_OPEN'; payload: boolean }
  | { type: 'SET_BULLETS'; payload: Bullet[] }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_HABIT_ENTRIES'; payload: HabitEntry[] }
  | { type: 'SET_LINKS'; payload: JournalLink[] }
  | { type: 'SET_BACKLINKS'; payload: JournalLink[] }
  | { type: 'SET_MOODS'; payload: DayMood[] }
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
  | { type: 'UPDATE_HABIT_ENTRY'; payload: HabitEntry }
  | { type: 'UPDATE_MOOD'; payload: DayMood };

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
  saveMood: (mood: DayMood) => Promise<void>;
  navigatetoLink: (target: string) => Promise<void>;
} | null>(null);

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedCollectionId: null, activeView: 'daily' };
    case 'SET_COLLECTION':
      return { ...state, selectedCollectionId: action.payload, activeView: 'collection' };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_BOOK_STYLE':
      return { ...state, bookStyle: action.payload };
    case 'SET_BOOK_OPEN':
      return { ...state, isBookOpen: action.payload };
    case 'SET_BULLETS':
      return { ...state, bullets: action.payload };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'SET_HABIT_ENTRIES':
      return { ...state, habitEntries: action.payload };
    case 'SET_LINKS':
      return { ...state, links: action.payload };
    case 'SET_BACKLINKS':
      return { ...state, backlinks: action.payload };
    case 'SET_MOODS':
      return { ...state, moods: action.payload };
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
    case 'UPDATE_MOOD':
      const filteredMoods = state.moods.filter(m => m.date !== action.payload.date);
      return { ...state, moods: [...filteredMoods, action.payload] };
    default:
      return state;
  }
}

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(journalReducer, {
    selectedDate: new Date().toISOString().split('T')[0],
    selectedCollectionId: null,
    activeView: 'daily',
    bookStyle: 'minimalist',
    isBookOpen: false,
    bullets: [],
    collections: [],
    habits: [],
    habitEntries: [],
    links: [],
    backlinks: [],
    moods: [],
    loading: true,
    searchTerm: '',
    theme: 'minimal',
  });

  useEffect(() => {
    async function init() {
      db.initDB();
      const collections = await db.getCollections();
      const habits = await db.getHabits();
      const moods = await db.getAllMoods();
      dispatch({ type: 'SET_COLLECTIONS', payload: collections });
      dispatch({ type: 'SET_HABITS', payload: habits });
      dispatch({ type: 'SET_MOODS', payload: moods });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Auto-open book after a small delay
      setTimeout(() => {
        dispatch({ type: 'SET_BOOK_OPEN', payload: true });
      }, 500);
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

    async function loadLinks() {
      const links = await db.getLinksBySource(currentLogId);
      const title = state.selectedCollectionId 
        ? state.collections.find(c => c.id === state.selectedCollectionId)?.title 
        : state.selectedDate;
      const backlinks = title ? await db.getLinksByTarget(title) : [];
      dispatch({ type: 'SET_LINKS', payload: links });
      dispatch({ type: 'SET_BACKLINKS', payload: backlinks });
    }

    if (!state.loading) {
      loadBullets();
      loadLinks();
    }
  }, [currentLogId, state.loading, state.activeView, state.searchTerm, state.collections]);

  const addBullet = async (logId: string) => {
    const content = '';
    const newBullet: Bullet = {
      id: crypto.randomUUID(),
      logId,
      content,
      type: 'task',
      status: 'todo',
      order: state.bullets.length,
      indent: 0,
    };
    await db.saveBullet(newBullet);
    dispatch({ type: 'ADD_BULLET', payload: newBullet });
  };

  const updateBullet = async (bullet: Bullet) => {
    const tags = bullet.content.match(/#\w+/g)?.map(t => t.slice(1)) || [];
    const linkMatches = bullet.content.match(/\[\[(.*?)\]\]/g)?.map(m => m.slice(2, -2)) || [];
    const updated = { ...bullet, tags, links: linkMatches };
    
    await db.saveBullet(updated);
    
    // Update links store
    await db.deleteLinksBySource(bullet.logId);
    for (const target of linkMatches) {
      await db.saveLink({
        id: crypto.randomUUID(),
        sourceId: bullet.logId,
        targetTitle: target
      });
    }

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

  const saveMood = async (mood: DayMood) => {
    await db.saveMood(mood);
    dispatch({ type: 'UPDATE_MOOD', payload: mood });
  };

  const navigatetoLink = async (target: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(target)) {
      dispatch({ type: 'SET_DATE', payload: target });
    } else {
      const collection = await db.getCollectionByTitle(target);
      if (collection) {
        dispatch({ type: 'SET_COLLECTION', payload: collection.id });
      } else {
        const newCol: Collection = { id: crypto.randomUUID(), title: target };
        await db.saveCollection(newCol);
        dispatch({ type: 'ADD_COLLECTION', payload: newCol });
        dispatch({ type: 'SET_COLLECTION', payload: newCol.id });
      }
    }
  };

  return (
    <JournalContext.Provider value={{ 
      state, dispatch, 
      addBullet, updateBullet, deleteBullet, reorderBullets,
      addCollection, deleteCollection,
      addHabit, toggleHabit, deleteHabit,
      saveMood, navigatetoLink
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
