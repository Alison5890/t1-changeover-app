import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Style, Line, Workstation, Role } from '../types';
import { SEED_STYLES, SEED_LINES, SEED_WORKSTATIONS } from '../lib/seedData';

interface ConfigState {
  styles: Style[];
  lines: Line[];
  workstations: Workstation[];
  activeRole: Role;
  activeLineId: string;
  isSeeded: boolean;

  setActiveRole: (role: Role) => void;
  setActiveLineId: (id: string) => void;

  // Style CRUD
  addStyle: (style: Style) => void;
  updateStyle: (id: string, patch: Partial<Style>) => void;
  deleteStyle: (id: string) => void;

  // Workstation CRUD
  addWorkstation: (ws: Workstation) => void;
  updateWorkstation: (id: string, patch: Partial<Workstation>) => void;
  deleteWorkstation: (id: string) => void;

  // Line CRUD
  addLine: (line: Line) => void;
  updateLine: (id: string, patch: Partial<Line>) => void;

  loadSeedConfig: () => void;
  resetAll: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      styles: [],
      lines: [],
      workstations: [],
      activeRole: 'ie-engineer',
      activeLineId: 'line-9',
      isSeeded: false,

      setActiveRole: (role) => set({ activeRole: role }),
      setActiveLineId: (id) => set({ activeLineId: id }),

      addStyle: (style) => set(s => ({ styles: [...s.styles, style] })),
      updateStyle: (id, patch) =>
        set(s => ({ styles: s.styles.map(st => st.id === id ? { ...st, ...patch } : st) })),
      deleteStyle: (id) =>
        set(s => ({ styles: s.styles.filter(st => st.id !== id) })),

      addWorkstation: (ws) => set(s => ({ workstations: [...s.workstations, ws] })),
      updateWorkstation: (id, patch) =>
        set(s => ({ workstations: s.workstations.map(w => w.id === id ? { ...w, ...patch } : w) })),
      deleteWorkstation: (id) =>
        set(s => ({ workstations: s.workstations.filter(w => w.id !== id) })),

      addLine: (line) => set(s => ({ lines: [...s.lines, line] })),
      updateLine: (id, patch) =>
        set(s => ({ lines: s.lines.map(l => l.id === id ? { ...l, ...patch } : l) })),

      loadSeedConfig: () => {
        if (get().isSeeded) return;
        set({ styles: SEED_STYLES, lines: SEED_LINES, workstations: SEED_WORKSTATIONS, isSeeded: true });
      },

      resetAll: () =>
        set({ styles: SEED_STYLES, lines: SEED_LINES, workstations: SEED_WORKSTATIONS }),
    }),
    { name: 't1-config' }
  )
);
