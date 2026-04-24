import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type BlockType = 'bullet' | 'task' | 'event' | 'note' | 'heading1' | 'heading2' | 'checklist' | 'image' | 'file' | 'callout' | 'canvas' | 'timer';
export type BulletStatus = 'todo' | 'done' | 'migrated' | 'scheduled' | 'cancelled';
export type DecorationType = 'sticker' | 'tape' | 'highlight';

export interface Block {
  id: string;
  logId: string;
  content: string;
  type: BlockType;
  status: BulletStatus;
  order: number;
  indent: number;
  tags?: string[];
  links?: string[];
  fileData?: Blob;
  fileName?: string;
  canvasData?: string; // DataURL for sketches
  rotation?: number;
  lockedUntil?: string; // ISO date for time capsules
  timerData?: {
    duration: number;
    completed: boolean;
  };
}

export interface Decoration {
  id: string;
  logId: string;
  type: DecorationType;
  content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface Collection {
  id: string;
  title: string;
  icon?: string;
  volumeId?: string; // For grouping into library books
}

export interface Habit {
  id: string;
  title: string;
  order: number;
  frequency: 'daily' | 'weekly';
}

export interface HabitEntry {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface JournalLink {
  id: string;
  sourceId: string;
  targetTitle: string;
  targetId?: string;
}

export interface DayMood {
  date: string;
  mood: number;
  energy: number;
  steps?: number;
  sleep?: number;
}

interface BulletJournalDB extends DBSchema {
  blocks: {
    key: string;
    value: Block;
    indexes: { 'by-log': string };
  };
  collections: {
    key: string;
    value: Collection;
    indexes: { 'by-title': string };
  };
  habits: {
    key: string;
    value: Habit;
  };
  habitEntries: {
    key: [string, string];
    value: HabitEntry;
    indexes: { 'by-date': string, 'by-habit': string };
  };
  links: {
    key: string;
    value: JournalLink;
    indexes: { 'by-source': string, 'by-target': string };
  };
  moods: {
    key: string;
    value: DayMood;
  };
  decorations: {
    key: string;
    value: Decoration;
    indexes: { 'by-log': string };
  };
}

let dbPromise: Promise<IDBPDatabase<BulletJournalDB>>;

export function initDB() {
  dbPromise = openDB<BulletJournalDB>('bullet-journal-db', 6, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const bulletStore = db.createObjectStore('blocks' as any, { keyPath: 'id' });
        bulletStore.createIndex('by-log', 'logId');
        db.createObjectStore('collections', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('habits', { keyPath: 'id' });
        const entryStore = db.createObjectStore('habitEntries', { keyPath: ['habitId', 'date'] });
        entryStore.createIndex('by-date', 'date');
        entryStore.createIndex('by-habit', 'habitId');
      }
      if (oldVersion < 3) {
        const linkStore = db.createObjectStore('links', { keyPath: 'id' });
        linkStore.createIndex('by-source', 'sourceId');
        linkStore.createIndex('by-target', 'targetTitle');
        db.createObjectStore('moods', { keyPath: 'date' });
      }
      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains('blocks')) {
           const blockStore = db.createObjectStore('blocks', { keyPath: 'id' });
           blockStore.createIndex('by-log', 'logId');
        }
      }
      if (oldVersion < 5) {
        const decoStore = db.createObjectStore('decorations', { keyPath: 'id' });
        decoStore.createIndex('by-log', 'logId');
      }
      if (oldVersion < 6) {
        // Biometric update handled via schema extension
      }
    },
  });
}

export async function getBlocks(logId: string): Promise<Block[]> {
  const db = await dbPromise;
  const blocks = await db.getAllFromIndex('blocks', 'by-log', logId);
  return blocks.sort((a, b) => a.order - b.order);
}

export async function getAllBlocks(): Promise<Block[]> {
  const db = await dbPromise;
  return db.getAll('blocks');
}

export async function saveBlock(block: Block) {
  const db = await dbPromise;
  return db.put('blocks', block);
}

export async function deleteBlock(id: string) {
  const db = await dbPromise;
  return db.delete('blocks', id);
}

export async function getCollections(): Promise<Collection[]> {
  const db = await dbPromise;
  return db.getAll('collections');
}

export async function getCollectionByTitle(title: string): Promise<Collection | undefined> {
  const db = await dbPromise;
  const collections = await db.getAll('collections');
  return collections.find(c => c.title.toLowerCase() === title.toLowerCase());
}

export async function saveCollection(collection: Collection) {
  const db = await dbPromise;
  return db.put('collections', collection);
}

export async function deleteCollection(id: string) {
  const db = await dbPromise;
  const tx = db.transaction(['collections', 'blocks', 'links'], 'readwrite');
  await tx.objectStore('collections').delete(id);
  
  const blockIndex = tx.objectStore('blocks').index('by-log');
  let cursor = await blockIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Habits
export async function getHabits(): Promise<Habit[]> {
  const db = await dbPromise;
  return db.getAll('habits');
}

export async function saveHabit(habit: Habit) {
  const db = await dbPromise;
  return db.put('habits', habit);
}

export async function deleteHabit(id: string) {
  const db = await dbPromise;
  const tx = db.transaction(['habits', 'habitEntries'], 'readwrite');
  await tx.objectStore('habits').delete(id);
  
  const entryIndex = tx.objectStore('habitEntries').index('by-habit');
  let cursor = await entryIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function getHabitEntries(dateRange: string[]): Promise<HabitEntry[]> {
  const db = await dbPromise;
  const entries: HabitEntry[] = [];
  for (const date of dateRange) {
    const dailyEntries = await db.getAllFromIndex('habitEntries', 'by-date', date);
    entries.push(...dailyEntries);
  }
  return entries;
}

export async function toggleHabit(habitId: string, date: string, completed: boolean) {
  const db = await dbPromise;
  return db.put('habitEntries', { habitId, date, completed });
}

// Links
export async function saveLink(link: JournalLink) {
  const db = await dbPromise;
  return db.put('links', link);
}

export async function getLinksBySource(sourceId: string): Promise<JournalLink[]> {
  const db = await dbPromise;
  return db.getAllFromIndex('links', 'by-source', sourceId);
}

export async function getLinksByTarget(targetTitle: string): Promise<JournalLink[]> {
  const db = await dbPromise;
  return db.getAllFromIndex('links', 'by-target', targetTitle);
}

export async function deleteLinksBySource(sourceId: string) {
  const db = await dbPromise;
  const tx = db.transaction('links', 'readwrite');
  const index = tx.store.index('by-source');
  let cursor = await index.openCursor(IDBKeyRange.only(sourceId));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Moods
export async function getMood(date: string): Promise<DayMood | undefined> {
  const db = await dbPromise;
  return db.get('moods', date);
}

export async function getAllMoods(): Promise<DayMood[]> {
  const db = await dbPromise;
  return db.getAll('moods');
}

export async function saveMood(mood: DayMood) {
  const db = await dbPromise;
  return db.put('moods', mood);
}

// Decorations
export async function getDecorations(logId: string): Promise<Decoration[]> {
  const db = await dbPromise;
  return db.getAllFromIndex('decorations', 'by-log', logId);
}

export async function saveDecoration(deco: Decoration) {
  const db = await dbPromise;
  return db.put('decorations', deco);
}

export async function deleteDecoration(id: string) {
  const db = await dbPromise;
  return db.delete('decorations', id);
}
