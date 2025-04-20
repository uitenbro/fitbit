// storage.js - abstracted storage layer with localStorage preference and retry UI

let storageBlocked = false;
let memoryStore = {};

const storage = {
  init(store) {
    memoryStore = store || {};
  },

  // Get a value by key
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(`[storage] localStorage get failed for key '${key}':`, e);
      storageBlocked = true;
    }
    return key in memoryStore ? memoryStore[key] : null;
  },

  // Set a value by key
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      storageBlocked = false;
    } catch (e) {
      console.warn(`[storage] localStorage set failed for key '${key}', using memory:`, e);
      memoryStore[key] = value;
      storageBlocked = true;
    }
    this.offerRetryUI();
  },

  // Remove a key
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storage] localStorage remove failed for key '${key}':`, e);
    }
    delete memoryStore[key];
  },

  // Retry saving all in-memory values to localStorage
  retryAll() {
    let allSucceeded = true;
    for (const [key, value] of Object.entries(memoryStore)) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        delete memoryStore[key];
        console.log(`[storage] Retried and saved key '${key}' to localStorage.`);
      } catch (e) {
        console.warn(`[storage] Retry failed for key '${key}':`, e);
        allSucceeded = false;
      }
    }
    storageBlocked = !allSucceeded;
  },

  // Show a button that allows user to retry saving to storage manually
  offerRetryUI() {
    if (!storageBlocked || document.getElementById('storage-retry-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'storage-retry-btn';
    btn.textContent = 'Enable Persistent Storage';
    btn.style = 'position:fixed;bottom:10px;right:10px;padding:0.5em 1em;z-index:1000;';

    btn.onclick = () => {
      this.retryAll();
      alert('Storage retry attempted. Check console for results.');
      btn.remove();
    };

    document.body.appendChild(btn);
  },

  // Debug function to see where data is stored
  async getWithSource(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { source: 'localStorage', value: JSON.parse(raw) };
    } catch (e) {
      console.warn(`[storage] Error accessing localStorage for key '${key}':`, e);
    }
    return { source: 'memory', value: key in memoryStore ? memoryStore[key] : null };
  }
};

// Optional: IndexedDB support (commented out for now)
/*
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const dbPromise = openDB('FitbitAppDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('appState')) {
      db.createObjectStore('appState');
    }
  },
});

// To use IndexedDB instead of localStorage:
// const db = await dbPromise;
// await db.put('appState', value, key);
// const result = await db.get('appState', key);
*/


window.storage = storage;
