import type { RAGStatus, Task, KittingItem, OBSheetEntry, WIPRunDownEntry } from '../types';

export function computeRAG(completed: number, total: number, shiftEndMinutes: number): RAGStatus {
  if (total === 0) return 'pending';
  if (completed === total) return 'green';
  const pct = completed / total;
  if (shiftEndMinutes < 60 || pct < 0.5) return 'red';
  if (shiftEndMinutes < 120 || pct < 0.75) return 'amber';
  return 'amber';
}

export function minutesUntilShiftEnd(shiftEndTime: string): number {
  const now = new Date();
  const [h, m] = shiftEndTime.split(':').map(Number);
  const end = new Date(now);
  end.setHours(h, m, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000));
}

export function getTaskCompletion(tasks: Task[], category?: string) {
  const filtered = category ? tasks.filter(t => t.category === category) : tasks;
  const done = filtered.filter(t => t.status === 'done' || t.status === 'signed-off').length;
  return { completed: done, total: filtered.length };
}

export function getKittingCompletion(items: KittingItem[]) {
  const done = items.filter(i => i.status === 'kitted' || i.status === 'verified').length;
  return { completed: done, total: items.length };
}

export function getOBCompletion(entries: OBSheetEntry[]) {
  const done = entries.filter(e => e.distributed).length;
  return { completed: done, total: entries.length };
}

export function getWIPStatus(entries: WIPRunDownEntry[]) {
  const logged = entries.filter(e => e.actualWIP !== null).length;
  const behind = entries.filter(e => e.status === 'behind').length;
  return { logged, total: entries.length, behind };
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return 'Shift Ended';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function countdownColor(minutes: number): string {
  if (minutes <= 60) return 'bg-red-500 text-white';
  if (minutes <= 120) return 'bg-amber-400 text-white';
  return 'bg-green-500 text-white';
}
