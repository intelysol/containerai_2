import { create } from 'zustand';
import { networkService } from '../services/native/network';

interface SyncQueueItem {
  id: string;
  containerNumber: string;
  referenceNumber: string;
  photoCount: number;
  uploadProgress: number;
  status: 'PENDING' | 'RESERVING' | 'UPLOADING' | 'VERIFYING' | 'COMPLETED' | 'FAILED';
  lastAttempt?: string;
  errorMessage?: string;
}

interface SyncState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  syncQueue: SyncQueueItem[];
  toggleSimulatedOffline: () => void;
  addToQueue: (item: Omit<SyncQueueItem, 'uploadProgress' | 'status'>) => void;
  syncAll: () => Promise<void>;
  retryItem: (id: string) => Promise<void>;
  removeItem: (id: string) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: networkService.isOnline(),
  isSimulatedOffline: networkService.getIsSimulated(),
  isSyncing: false,
  lastSyncTime: '2026-10-29 18:35',
  syncQueue: [
    {
      id: 'insp_03',
      containerNumber: 'TCLU 329182-1',
      referenceNumber: 'CC-2026-0895',
      photoCount: 1,
      uploadProgress: 0,
      status: 'PENDING',
      lastAttempt: '2026-10-29 18:15',
    },
  ],

  toggleSimulatedOffline: () => {
    const nextSim = !get().isSimulatedOffline;
    networkService.setSimulatedOffline(nextSim);
    set({
      isSimulatedOffline: nextSim,
      isOnline: !nextSim,
    });
  },

  addToQueue: (item) => {
    set((state) => ({
      syncQueue: [
        ...state.syncQueue.filter((i) => i.id !== item.id),
        {
          ...item,
          uploadProgress: 0,
          status: 'PENDING',
          lastAttempt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    }));
  },

  syncAll: async () => {
    if (!get().isOnline || get().isSyncing) return;
    set({ isSyncing: true });

    const items = [...get().syncQueue];
    for (const item of items) {
      if (item.status === 'COMPLETED') continue;

      // Step 1: Reserving
      set((state) => ({
        syncQueue: state.syncQueue.map((q) =>
          q.id === item.id ? { ...q, status: 'RESERVING', uploadProgress: 15 } : q
        ),
      }));
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Uploading photos
      for (let prog = 25; prog <= 85; prog += 30) {
        set((state) => ({
          syncQueue: state.syncQueue.map((q) =>
            q.id === item.id ? { ...q, status: 'UPLOADING', uploadProgress: prog } : q
          ),
        }));
        await new Promise((r) => setTimeout(r, 400));
      }

      // Step 3: Verifying & Completed
      set((state) => ({
        syncQueue: state.syncQueue.map((q) =>
          q.id === item.id ? { ...q, status: 'COMPLETED', uploadProgress: 100 } : q
        ),
        lastSyncTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      }));
    }

    set({ isSyncing: false });
  },

  retryItem: async (id: string) => {
    if (!get().isOnline) return;
    set((state) => ({
      syncQueue: state.syncQueue.map((q) =>
        q.id === id ? { ...q, status: 'PENDING', errorMessage: undefined } : q
      ),
    }));
    await get().syncAll();
  },

  removeItem: (id: string) => {
    set((state) => ({
      syncQueue: state.syncQueue.filter((q) => q.id !== id),
    }));
  },
}));

// Safely subscribe to network changes after store has been initialized
networkService.subscribe((online) => {
  const store = useSyncStore.getState();
  if (!store) return;
  useSyncStore.setState({ isOnline: online });
  const queue = store.syncQueue || [];
  if (online && queue.some((i) => i.status === 'PENDING' || i.status === 'FAILED')) {
    store.syncAll();
  }
});
