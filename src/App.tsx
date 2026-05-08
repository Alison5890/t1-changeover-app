import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { KittingScreen } from './screens/KittingScreen';
import { OBSheetScreen } from './screens/OBSheetScreen';
import { WIPScreen } from './screens/WIPScreen';
import { TaskScreen } from './screens/TaskScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { DataScreen } from './screens/DataScreen';
import { ReportScreen } from './screens/ReportScreen';
import { useConfigStore } from './store/useConfigStore';
import { useChangeoverStore } from './store/useChangeoverStore';
import { useKittingStore } from './store/useKittingStore';
import { useOBSheetStore } from './store/useOBSheetStore';
import { useWIPStore } from './store/useWIPStore';
import { useTaskStore } from './store/useTaskStore';
import { useHistoricalStore } from './store/useHistoricalStore';
import {
  generateKittingItems, generateOBEntries,
  generateWIPEntries, generateTasks, createSeedChangeover
} from './lib/seedData';

export default function App() {
  const { loadSeedConfig, workstations, isSeeded } = useConfigStore();
  const { events, addEvent } = useChangeoverStore();
  const { setItems: setKitting } = useKittingStore();
  const { setEntries: setOB } = useOBSheetStore();
  const { setEntries: setWIP } = useWIPStore();
  const { setTasks } = useTaskStore();
  const { seedHistorical, isSeeded: histSeeded } = useHistoricalStore();

  useEffect(() => {
    if (!isSeeded) loadSeedConfig();
  }, [isSeeded, loadSeedConfig]);

  useEffect(() => {
    if (!histSeeded) seedHistorical();
  }, [histSeeded, seedHistorical]);

  useEffect(() => {
    if (!isSeeded || workstations.length === 0) return;
    ['line-9', 'line-10'].forEach(lineId => {
      const existing = events.find(
        e => e.lineId === lineId && (e.status === 'upcoming' || e.status === 'in-progress')
      );
      if (!existing) {
        const co = createSeedChangeover(lineId);
        addEvent(co);
        const ws = workstations.filter(w => w.lineId === lineId);
        setKitting(generateKittingItems(co.id, ws));
        setOB(generateOBEntries(co.id, ws));
        setWIP(generateWIPEntries(co.id, lineId));
        setTasks(generateTasks(co.id));
      }
    });
  }, [isSeeded, workstations.length]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/kitting" element={<KittingScreen />} />
          <Route path="/ob-sheet" element={<OBSheetScreen />} />
          <Route path="/wip" element={<WIPScreen />} />
          <Route path="/tasks" element={<TaskScreen />} />
          <Route path="/report" element={<ReportScreen />} />
          <Route path="/data" element={<DataScreen />} />
          <Route path="/config" element={<ConfigScreen />} />
        </Routes>
        <NavBar />
      </div>
    </HashRouter>
  );
}
