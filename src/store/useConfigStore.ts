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
  setActiveRole: (role: Role) => void;
  setActiveLineId: (id: string) => void;
  addStyle: (style: Style) => void;
  addWorkstation: (ws: Workstation) => void;
  loadSeedConfig: () => void;
  isSeeded: boolean;
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
      addWorkstation: (ws) => set(s => ({ workstations: [...s.workstations, ws] })),
      loadSeedConfig: () => {
        if (get().isSeeded) return;
        set({ styles: SEED_STYLES, lines: SEED_LINES, workstations: SEED_WORKSTATIONS, isSeeded: true });
      },
    }),
    { name: 't1-config' }
  )
);
