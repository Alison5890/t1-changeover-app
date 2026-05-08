import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import type { Style, Workstation, MachineType } from '../types';

type Tab = 'styles' | 'workstations';

const MACHINE_TYPES: MachineType[] = ['SNLS', 'DNLS', 'OL', 'FL', 'BAR', 'KAN', 'MANUAL'];

const emptyStyle = (): Omit<Style, 'id' | 'createdAt'> => ({
  styleCode: '', productType: 'Shorts', smv: 0, totalOperations: 0,
});

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Style Form ──────────────────────────────────────────────────────────────
function StyleForm({ initial, onSave, onCancel }: {
  initial?: Style;
  onSave: (s: Style) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Style, 'id' | 'createdAt'>>(
    initial ? { styleCode: initial.styleCode, productType: initial.productType, smv: initial.smv, totalOperations: initial.totalOperations }
            : emptyStyle()
  );
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.styleCode.trim() && form.smv > 0 && form.totalOperations > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">{initial ? 'Edit Style' : 'Add New Style'}</h3>

        <Field label="Style Code *">
          <input className={input} value={form.styleCode} placeholder="e.g. ARL-SH-CARGO-25"
            onChange={e => set('styleCode', e.target.value)} />
        </Field>
        <Field label="Product Type">
          <select className={input} value={form.productType} onChange={e => set('productType', e.target.value)}>
            {['Shorts', 'Trouser', 'Jeans', 'Skirt', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SMV *">
            <input className={input} type="number" inputMode="decimal" min="0" step="0.1"
              value={form.smv || ''} placeholder="e.g. 18.5"
              onChange={e => set('smv', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Total Ops *">
            <input className={input} type="number" inputMode="numeric" min="0"
              value={form.totalOperations || ''} placeholder="e.g. 22"
              onChange={e => set('totalOperations', parseInt(e.target.value) || 0)} />
          </Field>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button disabled={!valid}
            onClick={() => onSave({ id: initial?.id ?? `style-${uid()}`, createdAt: initial?.createdAt ?? new Date().toISOString().split('T')[0], ...form })}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {initial ? 'Save Changes' : 'Add Style'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Workstation Form ────────────────────────────────────────────────────────
function WorkstationForm({ initial, lineId, onSave, onCancel, nextStation }: {
  initial?: Workstation;
  lineId: string;
  onSave: (ws: Workstation) => void;
  onCancel: () => void;
  nextStation: number;
}) {
  const [form, setForm] = useState({
    stationNumber: initial?.stationNumber ?? nextStation,
    operationName: initial?.operationName ?? '',
    machineType: (initial?.machineType ?? 'SNLS') as MachineType,
    operatorName: initial?.operatorName ?? '',
    mechanicZone: initial?.mechanicZone ?? 'Zone A',
  });
  const setF = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.operationName.trim() && form.operatorName.trim();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">{initial ? 'Edit Workstation' : 'Add Workstation'}</h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Station No. *">
            <input className={input} type="number" inputMode="numeric" min="1"
              value={form.stationNumber} onChange={e => setF('stationNumber', parseInt(e.target.value) || 1)} />
          </Field>
          <Field label="Machine Type">
            <select className={input} value={form.machineType}
              onChange={e => setF('machineType', e.target.value as MachineType)}>
              {MACHINE_TYPES.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Operation Name *">
          <input className={input} value={form.operationName} placeholder="e.g. Side Seam Join"
            onChange={e => setF('operationName', e.target.value)} />
        </Field>
        <Field label="Operator Name *">
          <input className={input} value={form.operatorName} placeholder="e.g. Lakshmi S."
            onChange={e => setF('operatorName', e.target.value)} />
        </Field>
        <Field label="Mechanic Zone">
          <select className={input} value={form.mechanicZone} onChange={e => setF('mechanicZone', e.target.value)}>
            {['Zone A', 'Zone B', 'Zone C'].map(z => <option key={z}>{z}</option>)}
          </select>
        </Field>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button disabled={!valid}
            onClick={() => onSave({ id: initial?.id ?? `ws-${lineId}-${uid()}`, lineId, ...form, machineType: form.machineType })}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {initial ? 'Save Changes' : 'Add Workstation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function DataScreen() {
  const { styles, workstations, lines, activeLineId, setActiveLineId,
          addStyle, updateStyle, deleteStyle,
          addWorkstation, updateWorkstation, deleteWorkstation } = useConfigStore();

  const [tab, setTab] = useState<Tab>('styles');
  const [styleModal, setStyleModal] = useState<{ mode: 'add' | 'edit'; item?: Style } | null>(null);
  const [wsModal, setWsModal] = useState<{ mode: 'add' | 'edit'; item?: Workstation } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'style' | 'ws'; id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');

  const lineWs = workstations
    .filter(w => w.lineId === activeLineId)
    .filter(w => w.operationName.toLowerCase().includes(search.toLowerCase()) || w.operatorName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.stationNumber - b.stationNumber);

  const filteredStyles = styles.filter(s =>
    s.styleCode.toLowerCase().includes(search.toLowerCase()) ||
    s.productType.toLowerCase().includes(search.toLowerCase())
  );

  const nextStation = Math.max(0, ...workstations.filter(w => w.lineId === activeLineId).map(w => w.stationNumber)) + 1;

  const handleStyleSave = (s: Style) => {
    if (styleModal?.mode === 'edit') updateStyle(s.id, s);
    else addStyle(s);
    setStyleModal(null);
  };

  const handleWsSave = (ws: Workstation) => {
    if (wsModal?.mode === 'edit') updateWorkstation(ws.id, ws);
    else addWorkstation(ws);
    setWsModal(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'style') deleteStyle(confirmDelete.id);
    else deleteWorkstation(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900">Data Manager</h1>
          <button
            onClick={() => tab === 'styles' ? setStyleModal({ mode: 'add' }) : setWsModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            {tab === 'styles' ? 'Add Style' : 'Add Workstation'}
          </button>
        </div>
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {(['styles', 'workstations'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(''); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {t === 'styles' ? `Styles (${styles.length})` : `Workstations (${lineWs.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Search */}
        <input
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={tab === 'styles' ? 'Search styles...' : 'Search operations or operators...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Line selector for workstations tab */}
        {tab === 'workstations' && (
          <div className="flex gap-2">
            {lines.map(l => (
              <button key={l.id} onClick={() => setActiveLineId(l.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeLineId === l.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {l.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Styles ── */}
        {tab === 'styles' && (
          <div className="space-y-2">
            {filteredStyles.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">No styles found. Add one above.</div>
            )}
            {filteredStyles.map(style => (
              <div key={style.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{style.styleCode}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{style.productType}</span>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <Kv k="SMV" v={style.smv.toString()} />
                      <Kv k="Ops" v={style.totalOperations.toString()} />
                      <Kv k="Added" v={style.createdAt} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setStyleModal({ mode: 'edit', item: style })}
                      className="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'style', id: style.id, name: style.styleCode })}
                      className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Workstations ── */}
        {tab === 'workstations' && (
          <div className="space-y-2">
            {lineWs.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">No workstations found. Add one above.</div>
            )}
            {lineWs.map(ws => (
              <div key={ws.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">WS{ws.stationNumber}</span>
                      <span className="text-sm font-bold text-gray-900 truncate">{ws.operationName}</span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{ws.machineType}</span>
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap">
                      <Kv k="Operator" v={ws.operatorName} />
                      <Kv k="Zone" v={ws.mechanicZone} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setWsModal({ mode: 'edit', item: ws })}
                      className="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'ws', id: ws.id, name: ws.operationName })}
                      className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {styleModal && (
        <StyleForm
          initial={styleModal.item}
          onSave={handleStyleSave}
          onCancel={() => setStyleModal(null)}
        />
      )}

      {wsModal && (
        <WorkstationForm
          initial={wsModal.item}
          lineId={activeLineId}
          nextStation={nextStation}
          onSave={handleWsSave}
          onCancel={() => setWsModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Delete?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">{k}:</span> {v}</span>
  );
}
