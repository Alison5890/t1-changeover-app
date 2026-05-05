import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useKittingStore } from '../store/useKittingStore';
import { useOBSheetStore } from '../store/useOBSheetStore';
import { useWIPStore } from '../store/useWIPStore';
import { useTaskStore } from '../store/useTaskStore';
import { ROLE_LABELS } from '../types';
import type { Role } from '../types';

const roles: Role[] = ['ie-engineer', 'supervisor', 'mechanic', 'store-helper', 'qc-checker'];

export function ConfigScreen() {
  const { activeRole, setActiveRole, styles, lines, workstations, activeLineId, setActiveLineId } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover: getKitting } = useKittingStore();
  const { getByChangeover: getOB } = useOBSheetStore();
  const { getByChangeover: getWIP } = useWIPStore();
  const { getByChangeover: getTasks } = useTaskStore();

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );

  const fromStyle = styles.find(s => s.id === activeCo?.fromStyleId);
  const toStyle = styles.find(s => s.id === activeCo?.toStyleId);
  const line = lines.find(l => l.id === activeLineId);

  const kittingItems = activeCo ? getKitting(activeCo.id) : [];
  const obEntries = activeCo ? getOB(activeCo.id) : [];
  const wipEntries = activeCo ? getWIP(activeCo.id) : [];
  const tasks = activeCo ? getTasks(activeCo.id) : [];
  const lineWs = workstations.filter(w => w.lineId === activeLineId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Configuration</h1>
        <p className="text-xs text-gray-500">Arvind Limited — Lines 9 & 10 Shorts</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Role Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Active Role</h2>
          <p className="text-xs text-gray-500 mb-3">Select your role. This determines which sign-off actions are available to you.</p>
          <div className="grid grid-cols-1 gap-2">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  activeRole === r
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className="text-lg">
                  {r === 'ie-engineer' ? '📐' : r === 'supervisor' ? '👷' : r === 'mechanic' ? '🔧' : r === 'store-helper' ? '📦' : '🔍'}
                </span>
                <span className="font-semibold text-sm">{ROLE_LABELS[r]}</span>
                {activeRole === r && <span className="ml-auto text-white">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Line Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Active Line</h2>
          <div className="grid grid-cols-2 gap-2">
            {lines.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLineId(l.id)}
                className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                  activeLineId === l.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {l.name}
                <p className="text-xs font-normal opacity-75 mt-0.5">{l.supervisorName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Changeover Summary */}
        {activeCo && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Active Changeover</h2>
            <div className="space-y-2 text-sm">
              <Row label="Line" value={line?.name ?? activeCo.lineId} />
              <Row label="Date" value={activeCo.date} />
              <Row label="T-1 Date" value={activeCo.t1Date} />
              <Row label="From Style" value={fromStyle?.styleCode ?? activeCo.fromStyleId} />
              <Row label="To Style" value={toStyle?.styleCode ?? activeCo.toStyleId} />
              <Row label="Shift Ends" value={activeCo.shiftEndTime} />
              <Row label="Status" value={activeCo.status} />
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Loaded Data</h2>
          <div className="space-y-2">
            <StatRow icon="👗" label="Styles" count={styles.length} />
            <StatRow icon="🏭" label="Lines" count={lines.length} />
            <StatRow icon="🪡" label="Workstations (Active Line)" count={lineWs.length} />
            <StatRow icon="📦" label="Kitting Items" count={kittingItems.length} />
            <StatRow icon="📋" label="OB Sheet Entries" count={obEntries.length} />
            <StatRow icon="📉" label="WIP Schedule Slots" count={wipEntries.length} />
            <StatRow icon="✅" label="T-1 Tasks" count={tasks.length} />
          </div>
        </div>

        {/* Styles list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Styles</h2>
          <div className="space-y-2">
            {styles.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-800">{s.styleCode}</p>
                  <p className="text-xs text-gray-400">{s.productType} · SMV {s.smv} · {s.totalOperations} ops</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workstations list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Workstations — {line?.name}</h2>
          <div className="space-y-1">
            {lineWs.map(ws => (
              <div key={ws.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full shrink-0">WS{ws.stationNumber}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{ws.operationName}</p>
                  <p className="text-xs text-gray-400">{ws.machineType} · {ws.operatorName} · {ws.mechanicZone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-4 text-center text-xs text-gray-400">
          <p>T-1 Changeover Checklist App</p>
          <p>NIFT Mumbai · Arvind Limited · Lines 9 & 10 Shorts</p>
          <p className="mt-1">Suryaansii Singh · BFT/22/60</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-800 font-semibold text-xs">{value}</span>
    </div>
  );
}

function StatRow({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}
