import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { useHistoricalStore } from '../store/useHistoricalStore';
import type { ChangeoverLog } from '../types/historical';

type ReportTab = 'overview' | 'rampup' | 'breakdown' | 'defects';

const PHASE_COLORS = { baseline: '#ef4444', 'partial-smed': '#f59e0b', 'full-smed': '#22c55e' };
const PHASE_LABELS = { baseline: 'Baseline', 'partial-smed': 'Partial SMED', 'full-smed': 'Full SMED' };
const PHASE_BG = {
  baseline: 'bg-red-100 text-red-700 border border-red-200',
  'partial-smed': 'bg-amber-100 text-amber-700 border border-amber-200',
  'full-smed': 'bg-green-100 text-green-700 border border-green-200',
};

function shortDate(d: string) {
  const dt = new Date(d);
  return `${dt.getDate()} Apr`;
}

export function ReportScreen() {
  const { logs, seedHistorical, isSeeded } = useHistoricalStore();
  const [tab, setTab] = useState<ReportTab>('overview');
  const [selectedLog, setSelectedLog] = useState<ChangeoverLog | null>(null);

  if (!isSeeded) seedHistorical();

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  // ── KPIs ──
  const baseline = sorted.filter(l => l.phase === 'baseline');
  const fullSmed = sorted.filter(l => l.phase === 'full-smed');
  const avgBaseline = Math.round(baseline.reduce((s, l) => s + l.totalDurationMin, 0) / (baseline.length || 1));
  const avgFullSmed = Math.round(fullSmed.reduce((s, l) => s + l.totalDurationMin, 0) / (fullSmed.length || 1));
  const reduction = Math.round(((avgBaseline - avgFullSmed) / avgBaseline) * 100);
  const avgBaselineDefect = (baseline.reduce((s, l) => s + l.defectRatePct, 0) / (baseline.length || 1)).toFixed(1);
  const avgFullSmedDefect = (fullSmed.reduce((s, l) => s + l.defectRatePct, 0) / (fullSmed.length || 1)).toFixed(1);
  const avgBaselineRampUp = Math.round(baseline.flatMap(l => l.rampUp).filter(r => r.hour === 1).reduce((s, r) => s + r.efficiency, 0) / (baseline.length || 1));
  const avgFullSmedRampUp = Math.round(fullSmed.flatMap(l => l.rampUp).filter(r => r.hour === 1).reduce((s, r) => s + r.efficiency, 0) / (fullSmed.length || 1));
  const avgFullSmedT1 = Math.round(fullSmed.reduce((s, l) => s + l.t1CompletionPct, 0) / (fullSmed.length || 1));

  // Chart data
  const durationChartData = sorted.map(l => ({
    date: shortDate(l.date),
    'Total (min)': l.totalDurationMin,
    'Internal (min)': l.internalTimeMin,
    phase: l.phase,
    baseline: avgBaseline,
  }));

  const t1ChartData = sorted.map(l => ({
    date: shortDate(l.date),
    'T-1 Completion %': l.t1CompletionPct,
    'Changeover (min)': l.totalDurationMin,
    phase: l.phase,
  }));

  // Ramp-up: show best baseline vs best full-smed
  const worstBaseline = baseline.reduce((a, b) => a.rampUp[0].efficiency < b.rampUp[0].efficiency ? a : b, baseline[0]);
  const bestFullSmed = fullSmed.reduce((a, b) => a.rampUp[0].efficiency > b.rampUp[0].efficiency ? a : b, fullSmed[0]);
  const midPartial = sorted.find(l => l.phase === 'partial-smed' && l.date === '2026-04-24');

  const rampUpChartData = Array.from({ length: 8 }, (_, i) => {
    const h = i + 1;
    return {
      hour: `Hr ${h}`,
      Baseline: worstBaseline?.rampUp.find(r => r.hour === h)?.efficiency ?? null,
      'Partial SMED': midPartial?.rampUp.find(r => r.hour === h)?.efficiency ?? null,
      'Full SMED': bestFullSmed?.rampUp.find(r => r.hour === h)?.efficiency ?? null,
      Target: 75,
    };
  });

  const breakdownChartData = (() => {
    const b = baseline[0];
    const f = fullSmed[fullSmed.length - 1];
    if (!b || !f) return [];
    return [
      { activity: 'WIP Clear', Baseline: b.breakdown.wipClearance, 'Full SMED': f.breakdown.wipClearance },
      { activity: 'Machine', Baseline: b.breakdown.machineSetup, 'Full SMED': f.breakdown.machineSetup },
      { activity: 'Thread', Baseline: b.breakdown.threadPrep, 'Full SMED': f.breakdown.threadPrep },
      { activity: 'Attachment', Baseline: b.breakdown.attachmentHandling, 'Full SMED': f.breakdown.attachmentHandling },
      { activity: 'Op Demo', Baseline: b.breakdown.operatorDemo, 'Full SMED': f.breakdown.operatorDemo },
      { activity: 'Fabric', Baseline: b.breakdown.fabricStaging, 'Full SMED': f.breakdown.fabricStaging },
      { activity: 'Trial Run', Baseline: b.breakdown.trialRun, 'Full SMED': f.breakdown.trialRun },
      { activity: 'Layout', Baseline: b.breakdown.layoutAdjustment, 'Full SMED': f.breakdown.layoutAdjustment },
    ];
  })();

  const defectChartData = sorted.map(l => ({
    date: shortDate(l.date),
    'Defect %': l.defectRatePct,
    phase: l.phase,
  }));

  const tabs: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'rampup', label: 'Ramp-Up', icon: '📈' },
    { key: 'breakdown', label: 'Breakdown', icon: '🔍' },
    { key: 'defects', label: 'Defects', icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">SMED Study Report</h1>
        <p className="text-xs text-gray-500">Lines 9 & 10 · April 20–30 · {sorted.length} changeovers observed</p>
      </div>

      {/* KPI Strip */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard label="Time Reduction" value={`${reduction}%`} sub={`${avgBaseline}→${avgFullSmed} min`} highlight />
          <KPICard label="Defect Rate" value={`${avgBaselineDefect}→${avgFullSmedDefect}%`} sub="Baseline→Full SMED" />
          <KPICard label="Hr-1 Efficiency" value={`${avgBaselineRampUp}→${avgFullSmedRampUp}%`} sub="Baseline→Full SMED" />
          <KPICard label="T-1 Completion" value={`${avgFullSmedT1}%`} sub="Avg in Full SMED phase" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <ChartCard title="Changeover Duration — All 10 Observations" sub="Total vs Internal time (minutes)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={durationChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={avgBaseline} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Baseline avg ${avgBaseline}m`, fontSize: 10, fill: '#ef4444' }} />
                  <Bar dataKey="Total (min)" radius={[4, 4, 0, 0]}>
                    {durationChartData.map((entry, i) => (
                      <Cell key={i} fill={PHASE_COLORS[entry.phase]} />
                    ))}
                  </Bar>
                  <Bar dataKey="Internal (min)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <PhaseLegend />
            </ChartCard>

            <ChartCard title="T-1 Completion % vs Changeover Time" sub="Higher prep → shorter changeover">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={t1ChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 110]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 120]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="T-1 Completion %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Changeover (min)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Log table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">All Changeover Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Line</th>
                      <th className="px-3 py-2 text-left">Style Change</th>
                      <th className="px-3 py-2 text-right">Time (m)</th>
                      <th className="px-3 py-2 text-right">T-1 %</th>
                      <th className="px-3 py-2 text-left">Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(log => (
                      <tr key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors">
                        <td className="px-3 py-2 font-medium text-gray-800">{shortDate(log.date)}</td>
                        <td className="px-3 py-2 text-gray-600">{log.lineId === 'line-9' ? 'L9' : 'L10'}</td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">
                          {log.fromStyleCode.split('-').slice(2).join('-')} → {log.toStyleCode.split('-').slice(2).join('-')}
                        </td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: PHASE_COLORS[log.phase] }}>
                          {log.totalDurationMin}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{log.t1CompletionPct}%</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PHASE_BG[log.phase]}`}>
                            {PHASE_LABELS[log.phase]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 px-4 py-2">Tap any row for detailed view</p>
            </div>
          </>
        )}

        {/* ── RAMP-UP ── */}
        {tab === 'rampup' && (
          <>
            <ChartCard title="Hourly Ramp-Up Efficiency — Day 1" sub="% of target efficiency by hour post-changeover">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={rampUpChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 90]} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: unknown) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={75} stroke="#6b7280" strokeDasharray="4 4" label={{ value: 'Target 75%', fontSize: 10, fill: '#6b7280' }} />
                  <Line type="monotone" dataKey="Baseline" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Partial SMED" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Full SMED" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-3 gap-3">
              <PhaseCard phase="baseline" avgHr1={avgBaselineRampUp} daysTo75={5} logs={baseline} />
              <PhaseCard phase="partial-smed" avgHr1={Math.round(sorted.filter(l => l.phase === 'partial-smed').flatMap(l => l.rampUp).filter(r => r.hour === 1).reduce((s, r) => s + r.efficiency, 0) / sorted.filter(l => l.phase === 'partial-smed').length)} daysTo75={3} logs={sorted.filter(l => l.phase === 'partial-smed')} />
              <PhaseCard phase="full-smed" avgHr1={avgFullSmedRampUp} daysTo75={2} logs={fullSmed} />
            </div>

            <ChartCard title="All 10 Days — End-of-Day-1 Efficiency" sub="Efficiency achieved by end of first production shift">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={sorted.map(l => ({ date: shortDate(l.date), Efficiency: l.rampUp[7].efficiency, phase: l.phase }))} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 90]} />
                  <Tooltip formatter={(v: unknown) => `${v}%`} />
                  <ReferenceLine y={75} stroke="#6b7280" strokeDasharray="4 4" />
                  <Bar dataKey="Efficiency" radius={[4, 4, 0, 0]}>
                    {sorted.map((l, i) => <Cell key={i} fill={PHASE_COLORS[l.phase]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <PhaseLegend />
            </ChartCard>
          </>
        )}

        {/* ── BREAKDOWN ── */}
        {tab === 'breakdown' && (
          <>
            <ChartCard title="Activity-wise Time: Baseline vs Full SMED" sub="Minutes per activity — April 20 vs April 30">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={breakdownChartData} layout="vertical" margin={{ top: 5, right: 20, left: 55, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="activity" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Baseline" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Full SMED" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Savings table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Activity-wise Savings</h3>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-left">Activity</th>
                    <th className="px-3 py-2 text-right">Baseline</th>
                    <th className="px-3 py-2 text-right">Full SMED</th>
                    <th className="px-3 py-2 text-right">Saved</th>
                    <th className="px-3 py-2 text-right">% Cut</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownChartData.map(row => {
                    const saved = row.Baseline - row['Full SMED'];
                    const pct = Math.round((saved / row.Baseline) * 100);
                    return (
                      <tr key={row.activity} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{row.activity}</td>
                        <td className="px-3 py-2 text-right text-red-600 font-bold">{row.Baseline}m</td>
                        <td className="px-3 py-2 text-right text-green-600 font-bold">{row['Full SMED']}m</td>
                        <td className="px-3 py-2 text-right text-blue-600 font-bold">{saved}m</td>
                        <td className="px-3 py-2 text-right text-gray-600">{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                    <td className="px-3 py-2 text-gray-800">TOTAL</td>
                    <td className="px-3 py-2 text-right text-red-600">{breakdownChartData.reduce((s, r) => s + r.Baseline, 0)}m</td>
                    <td className="px-3 py-2 text-right text-green-600">{breakdownChartData.reduce((s, r) => s + r['Full SMED'], 0)}m</td>
                    <td className="px-3 py-2 text-right text-blue-600">{breakdownChartData.reduce((s, r) => s + r.Baseline - r['Full SMED'], 0)}m</td>
                    <td className="px-3 py-2 text-right text-gray-600">{reduction}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── DEFECTS ── */}
        {tab === 'defects' && (
          <>
            <ChartCard title="First-50-Piece Defect Rate Trend" sub="% defects in first 50 pieces after changeover">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={defectChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 25]} />
                  <Tooltip formatter={(v: unknown) => `${v}%`} />
                  <ReferenceLine y={5} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Target 5%', fontSize: 10, fill: '#22c55e' }} />
                  <Line type="monotone" dataKey="Defect %" stroke="#ef4444" strokeWidth={2.5} dot={(props) => {
                    const { cx, cy, payload } = props;
                    const color = PHASE_COLORS[payload.phase as keyof typeof PHASE_COLORS] ?? '#6b7280';
                    return <circle key={payload.date} cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
              <PhaseLegend />
            </ChartCard>

            <div className="grid grid-cols-3 gap-3">
              {(['baseline', 'partial-smed', 'full-smed'] as const).map(phase => {
                const phaseLogs = sorted.filter(l => l.phase === phase);
                const avg = (phaseLogs.reduce((s, l) => s + l.defectRatePct, 0) / (phaseLogs.length || 1)).toFixed(1);
                return (
                  <div key={phase} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PHASE_BG[phase]}`}>{PHASE_LABELS[phase]}</span>
                    <p className="text-2xl font-black mt-2" style={{ color: PHASE_COLORS[phase] }}>{avg}%</p>
                    <p className="text-xs text-gray-500">avg defect rate</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-lg p-5 space-y-3 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{shortDate(selectedLog.date)} — {selectedLog.lineId === 'line-9' ? 'Line 9' : 'Line 10'}</h3>
                <p className="text-xs text-gray-500">{selectedLog.fromStyleCode} → {selectedLog.toStyleCode}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PHASE_BG[selectedLog.phase]}`}>{PHASE_LABELS[selectedLog.phase]}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Total Time" value={`${selectedLog.totalDurationMin} min`} color="text-red-600" />
              <Stat label="Internal Time" value={`${selectedLog.internalTimeMin} min`} color="text-amber-600" />
              <Stat label="Time Saved" value={`${selectedLog.externalTimeSavedMin} min`} color="text-green-600" />
              <Stat label="T-1 Completion" value={`${selectedLog.t1CompletionPct}%`} color="text-blue-600" />
              <Stat label="Defect Rate" value={`${selectedLog.defectRatePct}%`} color="text-purple-600" />
              <Stat label="Hr-1 Efficiency" value={`${selectedLog.rampUp[0].efficiency}%`} color="text-teal-600" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Field Notes</p>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedLog.notes}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Activity Breakdown</p>
              {Object.entries(selectedLog.breakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-xs font-bold text-gray-700">{v} min</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedLog(null)}
              className="w-full py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-white/20' : 'bg-white/10'}`}>
      <p className="text-xs text-blue-100 font-medium">{label}</p>
      <p className="text-xl font-black text-white mt-0.5">{value}</p>
      <p className="text-xs text-blue-200 mt-0.5">{sub}</p>
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-400 mb-3">{sub}</p>
      {children}
    </div>
  );
}

function PhaseLegend() {
  return (
    <div className="flex gap-4 mt-3 flex-wrap">
      {(Object.entries(PHASE_LABELS) as [keyof typeof PHASE_LABELS, string][]).map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: PHASE_COLORS[k] }} />
          <span className="text-xs text-gray-600">{v}</span>
        </div>
      ))}
    </div>
  );
}

function PhaseCard({ phase, avgHr1, daysTo75, logs }: { phase: keyof typeof PHASE_LABELS; avgHr1: number; daysTo75: number; logs: ChangeoverLog[] }) {
  const avgTime = Math.round(logs.reduce((s, l) => s + l.totalDurationMin, 0) / (logs.length || 1));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PHASE_BG[phase]}`}>{PHASE_LABELS[phase]}</span>
      <p className="text-xl font-black mt-2" style={{ color: PHASE_COLORS[phase] }}>{avgHr1}%</p>
      <p className="text-xs text-gray-500">Hr-1 efficiency</p>
      <p className="text-xs font-bold text-gray-700 mt-1">{avgTime} min avg</p>
      <p className="text-xs text-gray-400">{daysTo75} days to 75%</p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}
