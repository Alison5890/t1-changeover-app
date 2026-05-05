import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useWIPStore } from '../store/useWIPStore';
import type { WIPRunDownEntry } from '../types';

const SECTIONS = ['Front Sub-Assembly', 'Back Sub-Assembly', 'Assembly', 'Finishing'];

const STATUS_STYLES: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-700',
  'behind': 'bg-red-100 text-red-700',
  'ahead': 'bg-blue-100 text-blue-700',
  'not-logged': 'bg-gray-100 text-gray-500',
};

export function WIPScreen() {
  const { activeLineId } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover, logActual } = useWIPStore();

  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [modal, setModal] = useState<{ entryId: string; currentTarget: number } | null>(null);
  const [pendingActual, setPendingActual] = useState('');

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );

  const allEntries = activeCo ? getByChangeover(activeCo.id) : [];
  const sectionEntries = allEntries.filter(e => e.subSection === activeSection);
  const behindCount = sectionEntries.filter(e => e.status === 'behind').length;

  const chartData = sectionEntries.map(e => ({
    slot: e.hourSlot.split('–')[0],
    Target: e.targetWIP,
    Actual: e.actualWIP ?? undefined,
  }));

  const handleLogActual = (name: string) => {
    if (!modal || !pendingActual.trim()) return;
    const val = parseInt(pendingActual, 10);
    if (!isNaN(val)) logActual(modal.entryId, val, name);
    setModal(null);
    setPendingActual('');
  };

  if (!activeCo) {
    return <div className="p-6 text-center text-gray-500">No active changeover.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">WIP Run-Down Schedule</h1>
        <p className="text-xs text-gray-500">Line {activeLineId === 'line-9' ? '9' : '10'} — T-1 Day</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map(s => {
            const sBehind = allEntries.filter(e => e.subSection === s && e.status === 'behind').length;
            return (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeSection === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {s.split(' ')[0]}
                {sBehind > 0 && (
                  <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${activeSection === s ? 'bg-white text-blue-700' : 'bg-red-500 text-white'}`}>
                    {sBehind}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {behindCount > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3">
            <p className="text-red-800 text-sm font-bold">⚠️ {behindCount} slot{behindCount > 1 ? 's' : ''} behind target in {activeSection}</p>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">{activeSection} — WIP Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Target" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Actual" stroke="#3b82f6" dot={{ r: 4 }} strokeWidth={2} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hour-by-hour table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 border-b border-gray-100">
            <span>Time Slot</span>
            <span className="text-center">Target</span>
            <span className="text-center">Actual</span>
            <span className="text-center">Status</span>
          </div>
          {sectionEntries.map(entry => (
            <WIPRow
              key={entry.id}
              entry={entry}
              onLog={() => setModal({ entryId: entry.id, currentTarget: entry.targetWIP })}
            />
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Log Actual WIP</h3>
            <p className="text-sm text-gray-500">Target: <strong>{modal.currentTarget} pcs</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual WIP (pieces)</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                value={pendingActual}
                onChange={e => setPendingActual(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                id="wip-name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setPendingActual(''); }}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const nameEl = document.getElementById('wip-name') as HTMLInputElement;
                  handleLogActual(nameEl?.value || 'Supervisor');
                }}
                disabled={!pendingActual.trim()}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WIPRow({ entry, onLog }: { entry: WIPRunDownEntry; onLog: () => void }) {
  return (
    <div className="grid grid-cols-4 items-center px-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-700">{entry.hourSlot.split('–')[0]}</span>
      <span className="text-center text-sm font-bold text-gray-600">{entry.targetWIP}</span>
      <button
        onClick={entry.actualWIP === null ? onLog : undefined}
        className={`text-center text-sm font-bold rounded-lg py-1 mx-2 transition-colors ${
          entry.actualWIP !== null ? 'text-gray-800' : 'text-blue-500 bg-blue-50 hover:bg-blue-100 active:bg-blue-200'
        }`}
      >
        {entry.actualWIP !== null ? entry.actualWIP : '+ Log'}
      </button>
      <div className="flex justify-center">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[entry.status]}`}>
          {entry.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}
