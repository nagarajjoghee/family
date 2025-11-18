// IndexedDB service for storing photos client-side

const DB_NAME = 'KSVNPhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('photoId', 'photoId', { unique: false });
        objectStore.createIndex('fileName', 'fileName', { unique: false });
      }
    };
  });
};

export const savePhoto = async (photoId, file, metadata) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const photoData = {
        photoId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        data: e.target.result,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      };

      const request = store.add(photoData);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to save photo'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getPhoto = async (photoId) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('photoId');
    const request = index.getAll(photoId);
    
    request.onsuccess = () => {
      const photos = request.result;
      if (photos.length > 0) {
        resolve(photos[0]);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      reject(new Error('Failed to get photo'));
    };
  });
};

export const getAllPhotos = async () => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to get photos'));
    };
  });
};

export const deletePhoto = async (id) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete photo'));
    };
  });
};

export const deletePhotoByPhotoId = async (photoId) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('photoId');
    const request = index.openCursor(photoId);
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete photo'));
    };
  });
};

