import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useKittingStore } from '../store/useKittingStore';
import { useOBSheetStore } from '../store/useOBSheetStore';
import { useWIPStore } from '../store/useWIPStore';
import { useTaskStore } from '../store/useTaskStore';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import {
  computeRAG, minutesUntilShiftEnd, formatCountdown,
  countdownColor, getKittingCompletion, getOBCompletion, getTaskCompletion
} from '../lib/statusLogic';
import type { RAGStatus, TaskCategory } from '../types';
import { TASK_CATEGORY_LABELS } from '../types';

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  'ob-distribution': '📋',
  'kitting': '📦',
  'wip-run-down': '📉',
  'operator-demo': '👥',
  'mechanic-briefing': '🔧',
  'machine-setting-card': '⚙️',
  'fabric-staging': '🧵',
  'layout-sheet': '📐',
  'qc-spec-sheet': '🔍',
};

const CATEGORY_ROUTES: Record<TaskCategory, string> = {
  'ob-distribution': '/ob-sheet',
  'kitting': '/kitting',
  'wip-run-down': '/wip',
  'operator-demo': '/tasks',
  'mechanic-briefing': '/tasks',
  'machine-setting-card': '/tasks',
  'fabric-staging': '/tasks',
  'layout-sheet': '/tasks',
  'qc-spec-sheet': '/tasks',
};

export function DashboardScreen() {
  const navigate = useNavigate();
  const { activeLineId, setActiveLineId, lines, styles } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover: getKitting } = useKittingStore();
  const { getByChangeover: getOB } = useOBSheetStore();
  const { getByChangeover: getWIP } = useWIPStore();
  const { getByChangeover: getTasks } = useTaskStore();

  const [minutesLeft, setMinutesLeft] = useState(0);
  const [, forceUpdate] = useState(0);

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );
  const line = lines.find(l => l.id === activeLineId);
  const fromStyle = styles.find(s => s.id === activeCo?.fromStyleId);
  const toStyle = styles.find(s => s.id === activeCo?.toStyleId);

  useEffect(() => {
    const tick = () => {
      const mins = activeCo ? minutesUntilShiftEnd(activeCo.shiftEndTime) : 0;
      setMinutesLeft(mins);
      forceUpdate(n => n + 1);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [activeCo?.shiftEndTime]);

  if (!activeCo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="text-6xl mb-4">🏭</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Changeover</h2>
        <p className="text-gray-500 mb-6">Go to Config to set up a changeover event.</p>
        <button
          onClick={() => navigate('/config')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Open Config
        </button>
      </div>
    );
  }

  const kittingItems = getKitting(activeCo.id);
  const obEntries = getOB(activeCo.id);
  const tasks = getTasks(activeCo.id);
  const wipEntries = getWIP(activeCo.id);

  const kittingComp = getKittingCompletion(kittingItems);
  const obComp = getOBCompletion(obEntries);
  const wipLogged = wipEntries.filter(e => e.actualWIP !== null).length;
  const wipBehind = wipEntries.filter(e => e.status === 'behind').length;

  const taskCategories: TaskCategory[] = [
    'ob-distribution', 'kitting', 'wip-run-down', 'operator-demo',
    'mechanic-briefing', 'machine-setting-card', 'fabric-staging', 'layout-sheet', 'qc-spec-sheet'
  ];

  const categoryStats = taskCategories.map(cat => {
    let comp = { completed: 0, total: 0 };
    if (cat === 'kitting') comp = kittingComp;
    else if (cat === 'ob-distribution') comp = obComp;
    else if (cat === 'wip-run-down') comp = { completed: wipLogged, total: wipEntries.length };
    else comp = getTaskCompletion(tasks, cat);
    const rag: RAGStatus = computeRAG(comp.completed, comp.total, minutesLeft);
    return { cat, comp, rag };
  });

  const overallDone = categoryStats.filter(s => s.rag === 'green').length;
  const overallRag: RAGStatus = overallDone === categoryStats.length ? 'green'
    : categoryStats.some(s => s.rag === 'red') ? 'red' : 'amber';

  const incompleteCount = categoryStats.filter(s => s.rag !== 'green').length;
  const showAlert = minutesLeft < 120 && incompleteCount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">T-1 Dashboard</h1>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
          {/* Line Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {lines.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLineId(l.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeLineId === l.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alert Banner */}
        {showAlert && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800 text-sm">Shift ends in {formatCountdown(minutesLeft)}</p>
              <p className="text-red-700 text-sm">{incompleteCount} T-1 task{incompleteCount > 1 ? 's' : ''} still incomplete. Complete them before shift ends!</p>
            </div>
          </div>
        )}

        {/* Changeover Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{line?.name} — Changeover Day: {activeCo.date}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm font-bold text-gray-800">{fromStyle?.styleCode ?? activeCo.fromStyleId}</span>
                <span className="text-gray-400 text-lg">→</span>
                <span className="text-sm font-bold text-blue-700">{toStyle?.styleCode ?? activeCo.toStyleId}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Supervisor: {line?.supervisorName}</p>
            </div>
            <StatusBadge status={overallRag} />
          </div>
          {/* Countdown */}
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${countdownColor(minutesLeft)}`}>
            <span className="text-sm font-semibold opacity-90">Shift ends at {activeCo.shiftEndTime}</span>
            <span className="text-lg font-bold">{formatCountdown(minutesLeft)}</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">T-1 Overall Progress</h2>
          <ProgressBar completed={overallDone} total={categoryStats.length} />
          <p className="text-xs text-gray-400 mt-2">{overallDone} of {categoryStats.length} categories complete</p>
        </div>

        {/* Category Cards Grid */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Category Status</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryStats.map(({ cat, comp, rag }) => (
              <button
                key={cat}
                onClick={() => navigate(CATEGORY_ROUTES[cat])}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
              >
                <div className="text-2xl mb-2">{CATEGORY_ICONS[cat]}</div>
                <p className="text-xs font-bold text-gray-800 mb-2 leading-tight">{TASK_CATEGORY_LABELS[cat]}</p>
                <StatusBadge status={rag} />
                <p className="text-xs text-gray-400 mt-2">{comp.completed}/{comp.total}</p>
              </button>
            ))}
          </div>
        </div>

        {/* WIP Alert */}
        {wipBehind > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <p className="font-bold text-amber-800 text-sm">📉 WIP Behind Schedule</p>
            <p className="text-amber-700 text-sm">{wipBehind} section{wipBehind > 1 ? 's are' : ' is'} running behind target. Check WIP screen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
