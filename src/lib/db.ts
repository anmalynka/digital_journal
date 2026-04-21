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
}

export interface Collection {
  id: string;
  title: string;
  icon?: string;
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
}

let dbPromise: Promise<IDBPDatabase<BulletJournalDB>>;

export function initDB() {
  dbPromise = openDB<BulletJournalDB>('bullet-journal-db', 1, {
    upgrade(db) {
      const bulletStore = db.createObjectStore('bullets', { keyPath: 'id' });
      bulletStore.createIndex('by-log', 'logId');
      db.createObjectStore('collections', { keyPath: 'id' });
    },
  });
}

export async function getBullets(logId: string): Promise<Bullet[]> {
  const db = await dbPromise;
  const bullets = await db.getAllFromIndex('bullets', 'by-log', logId);
  return bullets.sort((a, b) => a.order - b.order);
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
