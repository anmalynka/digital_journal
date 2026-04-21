import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type BulletType = 'task' | 'event' | 'note';
export type BulletStatus = 'todo' | 'done' | 'migrated' | 'scheduled' | 'cancelled';

export interface Bullet {
  id: string;
  logId: string; // date string like '2026-04-21' or collection id
  content: string;
  type: BulletType;
  status: BulletStatus;
  order: number;
  indent: number;
  tags?: string[];
}

export interface Collection {
  id: string;
  title: string;
  icon?: string;
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

interface BulletJournalDB extends DBSchema {
  bullets: {
    key: string;
    value: Bullet;
    indexes: { 'by-log': string };
  };
  collections: {
    key: string;
    value: Collection;
  };
  habits: {
    key: string;
    value: Habit;
  };
  habitEntries: {
    key: [string, string]; // [habitId, date]
    value: HabitEntry;
    indexes: { 'by-date': string, 'by-habit': string };
  };
}

let dbPromise: Promise<IDBPDatabase<BulletJournalDB>>;

export function initDB() {
  dbPromise = openDB<BulletJournalDB>('bullet-journal-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const bulletStore = db.createObjectStore('bullets', { keyPath: 'id' });
        bulletStore.createIndex('by-log', 'logId');
        db.createObjectStore('collections', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('habits', { keyPath: 'id' });
        const entryStore = db.createObjectStore('habitEntries', { keyPath: ['habitId', 'date'] });
        entryStore.createIndex('by-date', 'date');
        entryStore.createIndex('by-habit', 'habitId');
      }
    },
  });
}

export async function getBullets(logId: string): Promise<Bullet[]> {
  const db = await dbPromise;
  const bullets = await db.getAllFromIndex('bullets', 'by-log', logId);
  return bullets.sort((a, b) => a.order - b.order);
}

export async function getAllBullets(): Promise<Bullet[]> {
  const db = await dbPromise;
  return db.getAll('bullets');
}

export async function saveBullet(bullet: Bullet) {
  const db = await dbPromise;
  return db.put('bullets', bullet);
}

export async function deleteBullet(id: string) {
  const db = await dbPromise;
  return db.delete('bullets', id);
}

export async function getCollections(): Promise<Collection[]> {
  const db = await dbPromise;
  return db.getAll('collections');
}

export async function saveCollection(collection: Collection) {
  const db = await dbPromise;
  return db.put('collections', collection);
}

export async function deleteCollection(id: string) {
  const db = await dbPromise;
  const tx = db.transaction(['collections', 'bullets'], 'readwrite');
  await tx.objectStore('collections').delete(id);
  
  const bulletIndex = tx.objectStore('bullets').index('by-log');
  let cursor = await bulletIndex.openCursor(IDBKeyRange.only(id));
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
