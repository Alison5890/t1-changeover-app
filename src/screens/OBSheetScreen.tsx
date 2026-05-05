import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useOBSheetStore } from '../store/useOBSheetStore';
import { SignoffModal } from '../components/SignoffModal';
import { ProgressBar } from '../components/ProgressBar';

export function OBSheetScreen() {
  const { activeLineId, workstations } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover, distributeOne, distributeAll } = useOBSheetStore();

  const [modal, setModal] = useState<{ entryId: string | 'all' } | null>(null);

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );

  const entries = activeCo ? getByChangeover(activeCo.id) : [];
  const done = entries.filter(e => e.distributed).length;

  const handleConfirm = (name: string) => {
    if (!modal) return;
    if (modal.entryId === 'all') {
      distributeAll(activeCo!.id, name);
    } else {
      distributeOne(modal.entryId, name, name);
    }
    setModal(null);
  };

  if (!activeCo) {
    return <div className="p-6 text-center text-gray-500">No active changeover.</div>;
  }

  const wsMap = Object.fromEntries(workstations.map(w => [w.id, w]));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">OB Sheet Distribution</h1>
            <p className="text-xs text-gray-500">Line {activeLineId === 'line-9' ? '9' : '10'} — {activeCo.date}</p>
          </div>
          <button
            onClick={() => setModal({ entryId: 'all' })}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Mark All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <ProgressBar completed={done} total={entries.length} />
          <p className="text-xs text-gray-400 mt-2">{done} of {entries.length} operators received OB sheet</p>
        </div>

        <div className="space-y-2">
          {entries.map(entry => {
            const ws = wsMap[entry.workstationId];
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-colors ${
                  entry.distributed ? 'border-green-200 bg-green-50' : 'border-gray-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">
                      WS{ws?.stationNumber ?? '?'}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{entry.operatorName}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{ws?.operationName} · {ws?.machineType}</p>
                  {entry.distributed && (
                    <p className="text-xs text-green-600 mt-0.5">
                      Distributed by {entry.distributedByIEName} · {entry.distributedAt ? new Date(entry.distributedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  )}
                </div>
                {entry.distributed ? (
                  <span className="text-green-600 text-xl shrink-0">✓</span>
                ) : (
                  <button
                    onClick={() => setModal({ entryId: entry.id })}
                    className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0"
                  >
                    Distribute
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <SignoffModal
          title={modal.entryId === 'all' ? 'Mark All OB Sheets Distributed' : 'Mark OB Sheet as Distributed'}
          label="Confirm Distribution"
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
