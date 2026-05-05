import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChangeoverEvent } from '../types';

interface ChangeoverState {
  events: ChangeoverEvent[];
  addEvent: (event: ChangeoverEvent) => void;
  updateEvent: (id: string, patch: Partial<ChangeoverEvent>) => void;
  getActiveEvent: (lineId: string) => ChangeoverEvent | undefined;
}

export const useChangeoverStore = create<ChangeoverState>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) => set(s => ({ events: [...s.events, event] })),
      updateEvent: (id, patch) =>
        set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) })),
      getActiveEvent: (lineId) =>
        get().events.find(e => e.lineId === lineId && (e.status === 'upcoming' || e.status === 'in-progress')),
    }),
    { name: 't1-changeovers' }
  )
);
