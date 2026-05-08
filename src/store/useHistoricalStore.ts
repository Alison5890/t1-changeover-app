import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChangeoverLog } from '../types/historical';
import { HISTORICAL_LOGS } from '../lib/historicalSeed';

interface HistoricalState {
  logs: ChangeoverLog[];
  isSeeded: boolean;
  seedHistorical: () => void;
  addLog: (log: ChangeoverLog) => void;
  updateLog: (id: string, patch: Partial<ChangeoverLog>) => void;
  deleteLog: (id: string) => void;
}

export const useHistoricalStore = create<HistoricalState>()(
  persist(
    (set, get) => ({
      logs: [],
      isSeeded: false,
      seedHistorical: () => {
        if (get().isSeeded) return;
        set({ logs: HISTORICAL_LOGS, isSeeded: true });
      },
      addLog: (log) => set(s => ({ logs: [...s.logs, log] })),
      updateLog: (id, patch) =>
        set(s => ({ logs: s.logs.map(l => l.id === id ? { ...l, ...patch } : l) })),
      deleteLog: (id) =>
        set(s => ({ logs: s.logs.filter(l => l.id !== id) })),
    }),
    { name: 't1-historical' }
  )
);
