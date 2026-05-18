import { openDB, IDBPDatabase } from 'idb';

interface Tab {
  id: string;
  title: string;
  content: string;
  savedAt: number;
  history: string[];
  historyIndex: number;
}

const DB_NAME = 'wikipxg-editor';
const DB_VERSION = 1;

let db: IDBPDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('tabs')) {
          database.createObjectStore('tabs', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings');
        }
      },
    });
  }
  return db;
}

export async function saveTab(tab: Tab): Promise<void> {
  const database = await getDB();
  await database.put('tabs', { ...tab, savedAt: Date.now() });
}

export async function loadAllTabs(): Promise<Tab[]> {
  const database = await getDB();
  return database.getAll('tabs');
}

export async function deleteTab(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('tabs', id);
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  const database = await getDB();
  await database.put('settings', value, key);
}

export async function loadSetting<T>(key: string): Promise<T | undefined> {
  const database = await getDB();
  return database.get('settings', key);
}

export type { Tab };
