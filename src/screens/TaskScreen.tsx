import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useTaskStore } from '../store/useTaskStore';
import { SignoffModal } from '../components/SignoffModal';
import { TaskStatusBadge } from '../components/StatusBadge';
import { TASK_CATEGORY_LABELS, ROLE_LABELS, ROLE_COLORS } from '../types';
import type { Role, Task } from '../types';

type RoleFilter = 'all' | Role;
type StatusFilter = 'all' | 'pending' | 'done' | 'signed-off';

const ROLE_BORDER: Record<Role, string> = {
  'ie-engineer': 'border-l-blue-500',
  'supervisor': 'border-l-purple-500',
  'mechanic': 'border-l-orange-500',
  'store-helper': 'border-l-green-500',
  'qc-checker': 'border-l-pink-500',
};

export function TaskScreen() {
  const { activeLineId, activeRole, setActiveRole } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover, markDone, signOff } = useTaskStore();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modal, setModal] = useState<{ task: Task; action: 'done' | 'signoff' } | null>(null);

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );

  const allTasks = activeCo ? getByChangeover(activeCo.id) : [];
  const doneTasks = allTasks.filter(t => t.status === 'done' || t.status === 'signed-off').length;

  const filtered = allTasks.filter(t => {
    const roleMatch = roleFilter === 'all' || t.responsibleRole === roleFilter;
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return roleMatch && statusMatch;
  });

  const handleConfirm = (name: string, notes: string) => {
    if (!modal) return;
    if (modal.action === 'done') markDone(modal.task.id, name, notes);
    else signOff(modal.task.id, name, activeRole, notes);
    setModal(null);
  };

  const roles: Role[] = ['ie-engineer', 'supervisor', 'mechanic', 'store-helper', 'qc-checker'];
  const statuses: StatusFilter[] = ['all', 'pending', 'done', 'signed-off'];

  if (!activeCo) {
    return <div className="p-6 text-center text-gray-500">No active changeover.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">T-1 Tasks</h1>
            <p className="text-xs text-gray-500">{doneTasks}/{allTasks.length} complete</p>
          </div>
          {/* Active Role Picker */}
          <select
            value={activeRole}
            onChange={e => setActiveRole(e.target.value as Role)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Role filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              roleFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            All Roles
          </button>
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No tasks match this filter.</div>
          )}
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onMarkDone={() => setModal({ task, action: 'done' })}
              onSignOff={() => setModal({ task, action: 'signoff' })}
            />
          ))}
        </div>
      </div>

      {modal && (
        <SignoffModal
          title={modal.action === 'done' ? `Mark as Done: ${TASK_CATEGORY_LABELS[modal.task.category]}` : `Sign Off: ${TASK_CATEGORY_LABELS[modal.task.category]}`}
          label={modal.action === 'done' ? 'Mark Done' : 'Sign Off'}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onMarkDone, onSignOff }: {
  task: Task;
  onMarkDone: () => void;
  onSignOff: () => void;
}) {
  const borderColor = ROLE_BORDER[task.responsibleRole];
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 ${borderColor} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[task.responsibleRole]}`}>
              {ROLE_LABELS[task.responsibleRole]}
            </span>
            <span className="text-xs text-gray-400">Due {task.dueByTime}</span>
          </div>
          <p className="text-sm font-bold text-gray-800 leading-snug">{task.description}</p>
          <p className="text-xs text-gray-400 mt-0.5">{TASK_CATEGORY_LABELS[task.category]}</p>
          {task.doneByName && (
            <p className="text-xs text-blue-600 mt-1">Done by {task.doneByName} · {task.doneAt ? new Date(task.doneAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
          )}
          {task.signedOffByName && (
            <p className="text-xs text-green-600 mt-0.5">Signed off by {task.signedOffByName}</p>
          )}
          {task.notes && <p className="text-xs text-gray-500 mt-1 italic">"{task.notes}"</p>}
        </div>
        <div className="shrink-0">
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      {task.status !== 'signed-off' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          {task.status === 'pending' && (
            <button
              onClick={onMarkDone}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Mark Done
            </button>
          )}
          {task.status === 'done' && (
            <button
              onClick={onSignOff}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors"
            >
              Sign Off
            </button>
          )}
        </div>
      )}
    </div>
  );
}
