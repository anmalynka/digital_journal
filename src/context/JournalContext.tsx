import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as db from '../lib/db';
import { Bullet, Collection } from '../lib/db';

interface JournalState {
  selectedDate: string; // ISO date string 'YYYY-MM-DD'
  selectedCollectionId: string | null;
  bullets: Bullet[];
  collections: Collection[];
  loading: boolean;
}

type JournalAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_COLLECTION'; payload: string | null }
  | { type: 'SET_BULLETS'; payload: Bullet[] }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_BULLET'; payload: Bullet }
  | { type: 'UPDATE_BULLET'; payload: Bullet }
  | { type: 'DELETE_BULLET'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string };

const JournalContext = createContext<{
  state: JournalState;
  dispatch: React.Dispatch<JournalAction>;
  addBullet: (logId: string) => Promise<void>;
  updateBullet: (bullet: Bullet) => Promise<void>;
  deleteBullet: (id: string) => Promise<void>;
  reorderBullets: (bullets: Bullet[]) => Promise<void>;
  addCollection: (title: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
} | null>(null);

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedCollectionId: null };
    case 'SET_COLLECTION':
      return { ...state, selectedCollectionId: action.payload };
    case 'SET_BULLETS':
      return { ...state, bullets: action.payload };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
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
    default:
      return state;
  }
}

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(journalReducer, {
    selectedDate: new Date().toISOString().split('T')[0],
    selectedCollectionId: null,
    bullets: [],
    collections: [],
    loading: true,
  });

  useEffect(() => {
    async function init() {
      db.initDB();
      const collections = await db.getCollections();
      dispatch({ type: 'SET_COLLECTIONS', payload: collections });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    init();
  }, []);

  const currentLogId = state.selectedCollectionId || state.selectedDate;

  useEffect(() => {
    async function loadBullets() {
      const bullets = await db.getBullets(currentLogId);
      dispatch({ type: 'SET_BULLETS', payload: bullets });
    }
    if (!state.loading) {
      loadBullets();
    }
  }, [currentLogId, state.loading]);

  const addBullet = async (logId: string) => {
    const newBullet: Bullet = {
      id: crypto.randomUUID(),
      logId,
      content: '',
      type: 'task',
      status: 'todo',
      order: state.bullets.length,
      indent: 0,
    };
    await db.saveBullet(newBullet);
    dispatch({ type: 'ADD_BULLET', payload: newBullet });
  };

  const updateBullet = async (bullet: Bullet) => {
    await db.saveBullet(bullet);
    dispatch({ type: 'UPDATE_BULLET', payload: bullet });
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
    }
  };

  return (
    <JournalContext.Provider value={{ 
      state, dispatch, 
      addBullet, updateBullet, deleteBullet, reorderBullets,
      addCollection, deleteCollection
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
