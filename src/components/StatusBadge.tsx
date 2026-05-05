import type { RAGStatus } from '../types';

const map: Record<RAGStatus, string> = {
  green: 'bg-green-100 text-green-800 border border-green-300',
  amber: 'bg-amber-100 text-amber-800 border border-amber-300',
  red: 'bg-red-100 text-red-800 border border-red-300',
  pending: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const dot: Record<RAGStatus, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  pending: 'bg-gray-400',
};

const label: Record<RAGStatus, string> = {
  green: 'Complete',
  amber: 'In Progress',
  red: 'Needs Attention',
  pending: 'Not Started',
};

export function StatusBadge({ status, customLabel }: { status: RAGStatus; customLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dot[status]}`} />
      {customLabel ?? label[status]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: 'pending' | 'done' | 'signed-off' }) {
  const styles = {
    pending: 'bg-gray-100 text-gray-600 border border-gray-200',
    done: 'bg-blue-100 text-blue-700 border border-blue-200',
    'signed-off': 'bg-green-100 text-green-700 border border-green-300',
  };
  const labels = { pending: 'Pending', done: 'Done', 'signed-off': 'Signed Off' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
