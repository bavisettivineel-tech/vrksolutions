import { useState, useEffect, useCallback } from "react";

export interface SavedPDF {
  id: string;
  title: string;
  fileUrl: string;
  blob: Blob;
  savedAt: string;
  fileSize: number;
}

const DB_NAME = "vrk_offline_pdfs";
const STORE_NAME = "pdfs";
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const useOfflinePDFs = () => {
  const [savedPDFs, setSavedPDFs] = useState<SavedPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedPDFs = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        setSavedPDFs(request.result || []);
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error("Error loading saved PDFs:", request.error);
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error opening database:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedPDFs();
  }, [loadSavedPDFs]);

  const savePDF = useCallback(async (id: string, title: string, fileUrl: string): Promise<boolean> => {
    try {
      // Fetch the PDF file
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF");
      
      const blob = await response.blob();
      
      const savedPDF: SavedPDF = {
        id,
        title,
        fileUrl,
        blob,
        savedAt: new Date().toISOString(),
        fileSize: blob.size,
      };

      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.put(savedPDF);
        
        request.onsuccess = () => {
          loadSavedPDFs();
          resolve(true);
        };

        request.onerror = () => {
          console.error("Error saving PDF:", request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error("Error saving PDF:", error);
      return false;
    }
  }, [loadSavedPDFs]);

  const removePDF = useCallback(async (id: string): Promise<boolean> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          loadSavedPDFs();
          resolve(true);
        };

        request.onerror = () => {
          console.error("Error removing PDF:", request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error("Error removing PDF:", error);
      return false;
    }
  }, [loadSavedPDFs]);

  const isPDFSaved = useCallback((id: string): boolean => {
    return savedPDFs.some((pdf) => pdf.id === id);
  }, [savedPDFs]);

  const getPDFBlob = useCallback(async (id: string): Promise<Blob | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result?.blob || null);
        };

        request.onerror = () => {
          console.error("Error getting PDF:", request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error("Error getting PDF:", error);
      return null;
    }
  }, []);

  const getTotalStorageUsed = useCallback((): number => {
    return savedPDFs.reduce((total, pdf) => total + pdf.fileSize, 0);
  }, [savedPDFs]);

  return {
    savedPDFs,
    isLoading,
    savePDF,
    removePDF,
    isPDFSaved,
    getPDFBlob,
    getTotalStorageUsed,
    refreshPDFs: loadSavedPDFs,
  };
};
