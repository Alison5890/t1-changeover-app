import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KittingItem, KittingStatus } from '../types';

interface KittingState {
  items: KittingItem[];
  setItems: (items: KittingItem[]) => void;
  updateItem: (id: string, patch: Partial<KittingItem>) => void;
  kitItem: (id: string, name: string) => void;
  verifyItem: (id: string, name: string) => void;
  getByChangeover: (changeoverEventId: string) => KittingItem[];
}

export const useKittingStore = create<KittingState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (newItems) =>
        set(s => {
          const existingIds = new Set(s.items.map(i => i.id));
          const toAdd = newItems.filter(i => !existingIds.has(i.id));
          return { items: [...s.items, ...toAdd] };
        }),
      updateItem: (id, patch) =>
        set(s => ({ items: s.items.map(i => i.id === id ? { ...i, ...patch } : i) })),
      kitItem: (id, name) =>
        set(s => ({
          items: s.items.map(i =>
            i.id === id ? { ...i, status: 'kitted' as KittingStatus, kittedByName: name, kittedAt: new Date().toISOString() } : i
          ),
        })),
      verifyItem: (id, name) =>
        set(s => ({
          items: s.items.map(i =>
            i.id === id ? { ...i, status: 'verified' as KittingStatus, verifiedByName: name, verifiedAt: new Date().toISOString() } : i
          ),
        })),
      getByChangeover: (changeoverEventId) =>
        get().items.filter(i => i.changeoverEventId === changeoverEventId),
    }),
    { name: 't1-kitting' }
  )
);
