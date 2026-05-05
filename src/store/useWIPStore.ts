import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WIPRunDownEntry, WIPStatus } from '../types';

interface WIPState {
  entries: WIPRunDownEntry[];
  setEntries: (entries: WIPRunDownEntry[]) => void;
  logActual: (id: string, actual: number, name: string) => void;
  getByChangeover: (changeoverEventId: string) => WIPRunDownEntry[];
}

function computeStatus(target: number, actual: number): WIPStatus {
  if (actual > target * 1.1) return 'behind';
  if (actual <= target * 0.9) return 'ahead';
  return 'on-track';
}

export const useWIPStore = create<WIPState>()(
  persist(
    (set, get) => ({
      entries: [],
      setEntries: (newEntries) =>
        set(s => {
          const existingIds = new Set(s.entries.map(e => e.id));
          const toAdd = newEntries.filter(e => !existingIds.has(e.id));
          return { entries: [...s.entries, ...toAdd] };
        }),
      logActual: (id, actual, name) =>
        set(s => ({
          entries: s.entries.map(e =>
            e.id === id
              ? { ...e, actualWIP: actual, status: computeStatus(e.targetWIP, actual), loggedByName: name, loggedAt: new Date().toISOString() }
              : e
          ),
        })),
      getByChangeover: (changeoverEventId) =>
        get().entries.filter(e => e.changeoverEventId === changeoverEventId),
    }),
    { name: 't1-wip' }
  )
);
