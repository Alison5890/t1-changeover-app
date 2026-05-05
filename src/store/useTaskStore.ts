import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Role } from '../types';

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  markDone: (id: string, name: string, notes?: string) => void;
  signOff: (id: string, name: string, role: Role, notes?: string) => void;
  getByChangeover: (changeoverEventId: string) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      setTasks: (newTasks) =>
        set(s => {
          const existingIds = new Set(s.tasks.map(t => t.id));
          const toAdd = newTasks.filter(t => !existingIds.has(t.id));
          return { tasks: [...s.tasks, ...toAdd] };
        }),
      markDone: (id, name, notes) =>
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, status: 'done' as const, doneByName: name, doneAt: new Date().toISOString(), notes: notes || t.notes }
              : t
          ),
        })),
      signOff: (id, name, role, notes) =>
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, status: 'signed-off' as const, signedOffByName: name, signedOffByRole: role, signedOffAt: new Date().toISOString(), notes: notes || t.notes }
              : t
          ),
        })),
      getByChangeover: (changeoverEventId) =>
        get().tasks.filter(t => t.changeoverEventId === changeoverEventId),
    }),
    { name: 't1-tasks' }
  )
);
