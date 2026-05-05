import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OBSheetEntry } from '../types';

interface OBSheetState {
  entries: OBSheetEntry[];
  setEntries: (entries: OBSheetEntry[]) => void;
  distributeOne: (id: string, ieName: string, signature: string) => void;
  distributeAll: (changeoverEventId: string, ieName: string) => void;
  getByChangeover: (changeoverEventId: string) => OBSheetEntry[];
}

export const useOBSheetStore = create<OBSheetState>()(
  persist(
    (set, get) => ({
      entries: [],
      setEntries: (newEntries) =>
        set(s => {
          const existingIds = new Set(s.entries.map(e => e.id));
          const toAdd = newEntries.filter(e => !existingIds.has(e.id));
          return { entries: [...s.entries, ...toAdd] };
        }),
      distributeOne: (id, ieName, signature) =>
        set(s => ({
          entries: s.entries.map(e =>
            e.id === id
              ? { ...e, distributed: true, distributedAt: new Date().toISOString(), distributedByIEName: ieName, receivedBySignature: signature }
              : e
          ),
        })),
      distributeAll: (changeoverEventId, ieName) =>
        set(s => ({
          entries: s.entries.map(e =>
            e.changeoverEventId === changeoverEventId && !e.distributed
              ? { ...e, distributed: true, distributedAt: new Date().toISOString(), distributedByIEName: ieName, receivedBySignature: 'Bulk distributed' }
              : e
          ),
        })),
      getByChangeover: (changeoverEventId) =>
        get().entries.filter(e => e.changeoverEventId === changeoverEventId),
    }),
    { name: 't1-obsheet' }
  )
);
