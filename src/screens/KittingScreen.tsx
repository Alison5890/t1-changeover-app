import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { useChangeoverStore } from '../store/useChangeoverStore';
import { useKittingStore } from '../store/useKittingStore';
import { SignoffModal } from '../components/SignoffModal';
import { ProgressBar } from '../components/ProgressBar';
import type { KittingItem, ItemType } from '../types';

const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  'attachment': 'bg-purple-100 text-purple-700',
  'thread': 'bg-yellow-100 text-yellow-700',
  'presser-foot': 'bg-blue-100 text-blue-700',
  'folder': 'bg-orange-100 text-orange-700',
  'needle': 'bg-red-100 text-red-700',
};

type Filter = 'all' | 'pending' | 'kitted' | 'verified';
type TypeFilter = 'all' | ItemType;

export function KittingScreen() {
  const { activeLineId, workstations } = useConfigStore();
  const { events } = useChangeoverStore();
  const { getByChangeover, kitItem, verifyItem } = useKittingStore();

  const [statusFilter, setStatusFilter] = useState<Filter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [expandedWs, setExpandedWs] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ itemId: string; action: 'kit' | 'verify' } | null>(null);

  const activeCo = events.find(
    e => e.lineId === activeLineId && (e.status === 'upcoming' || e.status === 'in-progress')
  );
  const lineWs = workstations.filter(w => w.lineId === activeLineId);
  const allItems = activeCo ? getByChangeover(activeCo.id) : [];

  const filtered = allItems.filter(i => {
    const statusMatch = statusFilter === 'all' || i.status === statusFilter;
    const typeMatch = typeFilter === 'all' || i.itemType === typeFilter;
    return statusMatch && typeMatch;
  });

  const done = allItems.filter(i => i.status === 'kitted' || i.status === 'verified').length;

  const toggleWs = (id: string) => {
    setExpandedWs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = (name: string) => {
    if (!modal) return;
    if (modal.action === 'kit') kitItem(modal.itemId, name);
    else verifyItem(modal.itemId, name);
    setModal(null);
  };

  if (!activeCo) {
    return <div className="p-6 text-center text-gray-500">No active changeover. Configure one first.</div>;
  }

  const statusTabs: Filter[] = ['all', 'pending', 'kitted', 'verified'];
  const types: TypeFilter[] = ['all', 'attachment', 'thread', 'presser-foot', 'folder', 'needle'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Kitting Checklist</h1>
        <p className="text-xs text-gray-500">Line {activeLineId === 'line-9' ? '9' : '10'} — {activeCo.date}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <ProgressBar completed={done} total={allItems.length} />
          <p className="text-xs text-gray-400 mt-2">{done} of {allItems.length} items kitted/verified</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                typeFilter === t ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {t === 'all' ? 'All Types' : t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Workstation accordions */}
        <div className="space-y-3">
          {lineWs.map(ws => {
            const wsItems = filtered.filter(i => i.workstationId === ws.id);
            if (wsItems.length === 0) return null;
            const wsAll = allItems.filter(i => i.workstationId === ws.id);
            const wsDone = wsAll.filter(i => i.status !== 'pending').length;
            const isOpen = expandedWs.has(ws.id);
            return (
              <div key={ws.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleWs(ws.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">WS{ws.stationNumber}</span>
                      <span className="text-sm font-bold text-gray-800">{ws.operationName}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{ws.machineType} · {ws.operatorName} · {ws.mechanicZone}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-2 shrink-0">
                    <span className={`text-xs font-bold ${wsDone === wsAll.length ? 'text-green-600' : 'text-gray-500'}`}>
                      {wsDone}/{wsAll.length}
                    </span>
                    <span className="text-gray-400 text-lg">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {wsItems.map(item => (
                      <KittingItemRow
                        key={item.id}
                        item={item}
                        onKit={() => setModal({ itemId: item.id, action: 'kit' })}
                        onVerify={() => setModal({ itemId: item.id, action: 'verify' })}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <SignoffModal
          title={modal.action === 'kit' ? 'Mark Item as Kitted' : 'Verify Item'}
          label={modal.action === 'kit' ? 'Kit It' : 'Verify'}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}

function KittingItemRow({ item, onKit, onVerify }: { item: KittingItem; onKit: () => void; onVerify: () => void }) {
  const statusStyles = {
    pending: 'border-gray-200 bg-white',
    kitted: 'border-blue-200 bg-blue-50',
    verified: 'border-green-200 bg-green-50',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-t border-gray-100 ${statusStyles[item.status]}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ITEM_TYPE_COLORS[item.itemType]}`}>
            {item.itemType.replace('-', ' ')}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate">{item.itemName}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} {item.unit}</p>
        {item.kittedByName && (
          <p className="text-xs text-blue-600 mt-0.5">Kitted by {item.kittedByName}</p>
        )}
        {item.verifiedByName && (
          <p className="text-xs text-green-600 mt-0.5">Verified by {item.verifiedByName}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        {item.status === 'pending' && (
          <button
            onClick={onKit}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Kit It
          </button>
        )}
        {item.status === 'kitted' && (
          <button
            onClick={onVerify}
            className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            Verify
          </button>
        )}
        {item.status === 'verified' && (
          <span className="px-3 py-2 text-xs font-bold text-green-700">✓ Done</span>
        )}
      </div>
    </div>
  );
}
