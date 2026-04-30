import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as db from '../lib/db';
import { Block, Collection, Habit, HabitEntry, JournalLink, DayMood, BlockType, Decoration } from '../lib/db';

export type JournalView = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'habit' | 'search' | 'collection' | 'calendar' | 'graph' | 'pixels' | 'library' | 'dashboard' | 'oracle' | 'stats' | 'detail';
export type BookStyle = 'modern' | 'minimalist' | 'parchment' | 'watercolor';

interface JournalState {
  selectedDate: string;
  selectedCollectionId: string | null;
  activeView: JournalView;
  bookStyle: BookStyle;
  isBookOpen: boolean;
  blocks: Block[];
  collections: Collection[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  links: JournalLink[];
  backlinks: JournalLink[];
  moods: DayMood[];
  decorations: Decoration[];
  hasCompletedSetup: boolean;
  loading: boolean;
  searchTerm: string;
  theme: string;
}

type JournalAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'COMPLETE_SETUP' }
  | { type: 'SET_COLLECTION'; payload: string | null }
  | { type: 'SET_VIEW'; payload: JournalView }
  | { type: 'SET_BOOK_STYLE'; payload: BookStyle }
  | { type: 'SET_BOOK_OPEN'; payload: boolean }
  | { type: 'SET_BLOCKS'; payload: Block[] }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_HABIT_ENTRIES'; payload: HabitEntry[] }
  | { type: 'SET_LINKS'; payload: JournalLink[] }
  | { type: 'SET_BACKLINKS'; payload: JournalLink[] }
  | { type: 'SET_MOODS'; payload: DayMood[] }
  | { type: 'SET_DECORATIONS'; payload: Decoration[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'ADD_BLOCK'; payload: Block }
  | { type: 'UPDATE_BLOCK'; payload: Block }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'UPDATE_HABIT_ENTRY'; payload: HabitEntry }
  | { type: 'UPDATE_MOOD'; payload: DayMood }
  | { type: 'ADD_DECORATION'; payload: Decoration }
  | { type: 'UPDATE_DECORATION'; payload: Decoration }
  | { type: 'DELETE_DECORATION'; payload: string };

const JournalContext = createContext<{
  state: JournalState;
  dispatch: React.Dispatch<JournalAction>;
  addBlock: (logId: string, type?: BlockType) => Promise<void>;
  updateBlock: (block: Block) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (blocks: Block[]) => Promise<void>;
  addCollection: (title: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string, completed: boolean) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  saveMood: (mood: DayMood) => Promise<void>;
  navigatetoLink: (target: string) => Promise<void>;
  addDecoration: (deco: Omit<Decoration, 'id' | 'logId'>) => Promise<void>;
  updateDecoration: (deco: Decoration) => Promise<void>;
  deleteDecoration: (id: string) => Promise<void>;
} | null>(null);

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedCollectionId: null, activeView: 'daily' };
    case 'COMPLETE_SETUP':
      localStorage.setItem('bujo_setup_complete', 'true');
      return { ...state, hasCompletedSetup: true, isBookOpen: true };
    case 'SET_COLLECTION':
      return { ...state, selectedCollectionId: action.payload, activeView: 'collection' };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_BOOK_STYLE':
      return { ...state, bookStyle: action.payload };
    case 'SET_BOOK_OPEN':
      return { ...state, isBookOpen: action.payload };
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload };
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
    case 'SET_DECORATIONS':
      return { ...state, decorations: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload, activeView: 'search' };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_BLOCK':
      return { ...state, blocks: [...(state.blocks || []), action.payload].sort((a, b) => a.order - b.order) };
    case 'UPDATE_BLOCK':
      return { ...state, blocks: state.blocks.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BLOCK':
      return { ...state, blocks: state.blocks.filter(b => b.id !== action.payload) };
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
    case 'ADD_DECORATION':
      return { ...state, decorations: [...state.decorations, action.payload] };
    case 'UPDATE_DECORATION':
      return { ...state, decorations: state.decorations.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DECORATION':
      return { ...state, decorations: state.decorations.filter(d => d.id !== action.payload) };
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
    blocks: [],
    collections: [],
    habits: [],
    habitEntries: [],
    links: [],
    backlinks: [],
    moods: [],
    decorations: [],
    hasCompletedSetup: localStorage.getItem('bujo_setup_complete') === 'true',
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
      
      setTimeout(() => {
        dispatch({ type: 'SET_BOOK_OPEN', payload: true });
      }, 500);
    }
    init();
  }, []);

  const currentLogId = state.selectedCollectionId || state.selectedDate;

  useEffect(() => {
    async function loadBlocks() {
      if (state.activeView === 'search') {
        const all = await db.getAllBlocks();
        const filtered = all.filter(b => 
          b.content.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          (b.tags && b.tags.some(t => t.toLowerCase().includes(state.searchTerm.toLowerCase())))
        );
        dispatch({ type: 'SET_BLOCKS', payload: filtered });
      } else {
        const blocks = await db.getBlocks(currentLogId);
        dispatch({ type: 'SET_BLOCKS', payload: blocks });
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

    async function loadDecorations() {
      const decos = await db.getDecorations(currentLogId);
      dispatch({ type: 'SET_DECORATIONS', payload: decos });
    }

    if (!state.loading) {
      loadBlocks();
      loadLinks();
      loadDecorations();
    }
  }, [currentLogId, state.loading, state.activeView, state.searchTerm, state.collections]);

  const addBlock = async (logId: string, type: BlockType = 'task') => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      logId,
      content: '',
      type,
      status: 'todo',
      order: state.blocks?.length || 0,
      indent: 0,
    };
    await db.saveBlock(newBlock);
    dispatch({ type: 'ADD_BLOCK', payload: newBlock });
  };

  const updateBlock = async (block: Block) => {
    const tags = block.content.match(/#\w+/g)?.map(t => t.slice(1)) || [];
    const linkMatches = block.content.match(/\[\[(.*?)\]\]/g)?.map(m => m.slice(2, -2)) || [];
    const updated = { ...block, tags, links: linkMatches };
    
    await db.saveBlock(updated);
    await db.deleteLinksBySource(block.logId);
    for (const target of linkMatches) {
      await db.saveLink({
        id: crypto.randomUUID(),
        sourceId: block.logId,
        targetTitle: target
      });
    }
    dispatch({ type: 'UPDATE_BLOCK', payload: updated });
  };

  const deleteBlock = async (id: string) => {
    await db.deleteBlock(id);
    dispatch({ type: 'DELETE_BLOCK', payload: id });
  };

  const reorderBlocks = async (blocks: Block[]) => {
    const updated = blocks.map((b, i) => ({ ...b, order: i }));
    for (const b of updated) {
      await db.saveBlock(b);
    }
    dispatch({ type: 'SET_BLOCKS', payload: updated });
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

  const addDecoration = async (deco: Omit<Decoration, 'id' | 'logId'>) => {
    const newDeco: Decoration = {
      ...deco,
      id: crypto.randomUUID(),
      logId: currentLogId
    };
    await db.saveDecoration(newDeco);
    dispatch({ type: 'ADD_DECORATION', payload: newDeco });
  };

  const updateDecoration = async (deco: Decoration) => {
    await db.saveDecoration(deco);
    dispatch({ type: 'UPDATE_DECORATION', payload: deco });
  };

  const deleteDecoration = async (id: string) => {
    await db.deleteDecoration(id);
    dispatch({ type: 'DELETE_DECORATION', payload: id });
  };

  return (
    <JournalContext.Provider value={{ 
      state, dispatch, 
      addBlock, updateBlock, deleteBlock, reorderBlocks,
      addCollection, deleteCollection,
      addHabit, toggleHabit, deleteHabit,
      saveMood, navigatetoLink,
      addDecoration, updateDecoration, deleteDecoration
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
