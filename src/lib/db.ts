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
  links?: string[]; // IDs or Titles of linked logs/collections
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

export interface JournalLink {
  id: string;
  sourceId: string; // ID of the log/collection containing the link
  targetTitle: string; // Title or Date linked to
  targetId?: string; // Resolved ID if it exists
}

export interface DayMood {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
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
    indexes: { 'by-title': string };
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
  links: {
    key: string;
    value: JournalLink;
    indexes: { 'by-source': string, 'by-target': string };
  };
  moods: {
    key: string; // date
    value: DayMood;
  };
}

let dbPromise: Promise<IDBPDatabase<BulletJournalDB>>;

export function initDB() {
  dbPromise = openDB<BulletJournalDB>('bullet-journal-db', 3, {
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
      if (oldVersion < 3) {
        const linkStore = db.createObjectStore('links', { keyPath: 'id' });
        linkStore.createIndex('by-source', 'sourceId');
        linkStore.createIndex('by-target', 'targetTitle');
        db.createObjectStore('moods', { keyPath: 'date' });
        // In some cases we might need to add index to existing store
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
  const tx = db.transaction(['collections', 'bullets', 'links'], 'readwrite');
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
