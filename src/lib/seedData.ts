import type {
  Style, Line, Workstation, ChangeoverEvent,
  KittingItem, OBSheetEntry, WIPRunDownEntry, Task
} from '../types';

export const SEED_STYLES: Style[] = [
  { id: 'style-001', styleCode: 'ARL-SH-CARGO-24', productType: 'Shorts', smv: 18.5, totalOperations: 22, createdAt: '2025-01-01' },
  { id: 'style-002', styleCode: 'ARL-SH-CHINO-24', productType: 'Shorts', smv: 16.2, totalOperations: 19, createdAt: '2025-01-01' },
  { id: 'style-003', styleCode: 'ARL-SH-DENIM-25', productType: 'Shorts', smv: 21.0, totalOperations: 25, createdAt: '2025-01-01' },
];

export const SEED_LINES: Line[] = [
  { id: 'line-9', lineNumber: 9, name: 'Line 9', supervisorName: 'Ramesh Kumar', shiftStartTime: '08:00', shiftEndTime: '17:30' },
  { id: 'line-10', lineNumber: 10, name: 'Line 10', supervisorName: 'Priya Nair', shiftStartTime: '08:00', shiftEndTime: '17:30' },
];

export const SEED_WORKSTATIONS: Workstation[] = [
  // Line 9
  { id: 'ws-9-1', lineId: 'line-9', stationNumber: 1, operationName: 'Front Pocket Bag Attach', machineType: 'SNLS', operatorName: 'Lakshmi S.', mechanicZone: 'Zone A' },
  { id: 'ws-9-2', lineId: 'line-9', stationNumber: 2, operationName: 'Front Pocket Mouth Hem', machineType: 'SNLS', operatorName: 'Kavitha R.', mechanicZone: 'Zone A' },
  { id: 'ws-9-3', lineId: 'line-9', stationNumber: 3, operationName: 'Side Seam Join', machineType: 'DNLS', operatorName: 'Meena T.', mechanicZone: 'Zone A' },
  { id: 'ws-9-4', lineId: 'line-9', stationNumber: 4, operationName: 'Back Pocket Mark & Attach', machineType: 'SNLS', operatorName: 'Sunita D.', mechanicZone: 'Zone A' },
  { id: 'ws-9-5', lineId: 'line-9', stationNumber: 5, operationName: 'Back Pocket Bartack', machineType: 'BAR', operatorName: 'Radha P.', mechanicZone: 'Zone B' },
  { id: 'ws-9-6', lineId: 'line-9', stationNumber: 6, operationName: 'Inseam Join', machineType: 'OL', operatorName: 'Anitha K.', mechanicZone: 'Zone B' },
  { id: 'ws-9-7', lineId: 'line-9', stationNumber: 7, operationName: 'Belt Loop Attach', machineType: 'KAN', operatorName: 'Geetha M.', mechanicZone: 'Zone B' },
  { id: 'ws-9-8', lineId: 'line-9', stationNumber: 8, operationName: 'Waistband Attach', machineType: 'SNLS', operatorName: 'Saroja N.', mechanicZone: 'Zone B' },
  { id: 'ws-9-9', lineId: 'line-9', stationNumber: 9, operationName: 'Fly Zip Attach', machineType: 'SNLS', operatorName: 'Usha B.', mechanicZone: 'Zone B' },
  { id: 'ws-9-10', lineId: 'line-9', stationNumber: 10, operationName: 'Bottom Hem Turn', machineType: 'FL', operatorName: 'Vijaya C.', mechanicZone: 'Zone C' },
  { id: 'ws-9-11', lineId: 'line-9', stationNumber: 11, operationName: 'Bottom Hem Stitch', machineType: 'SNLS', operatorName: 'Parvathi L.', mechanicZone: 'Zone C' },
  { id: 'ws-9-12', lineId: 'line-9', stationNumber: 12, operationName: 'Button & Buttonhole', machineType: 'MANUAL', operatorName: 'Kamala S.', mechanicZone: 'Zone C' },
  // Line 10
  { id: 'ws-10-1', lineId: 'line-10', stationNumber: 1, operationName: 'Front Rise Join', machineType: 'SNLS', operatorName: 'Bharathi V.', mechanicZone: 'Zone A' },
  { id: 'ws-10-2', lineId: 'line-10', stationNumber: 2, operationName: 'Front Pocket Facing Attach', machineType: 'SNLS', operatorName: 'Chitra M.', mechanicZone: 'Zone A' },
  { id: 'ws-10-3', lineId: 'line-10', stationNumber: 3, operationName: 'Crotch Seam Join', machineType: 'OL', operatorName: 'Devi R.', mechanicZone: 'Zone A' },
  { id: 'ws-10-4', lineId: 'line-10', stationNumber: 4, operationName: 'Back Yoke Attach', machineType: 'DNLS', operatorName: 'Eswari T.', mechanicZone: 'Zone A' },
  { id: 'ws-10-5', lineId: 'line-10', stationNumber: 5, operationName: 'Side Seam Join', machineType: 'DNLS', operatorName: 'Fathima K.', mechanicZone: 'Zone B' },
  { id: 'ws-10-6', lineId: 'line-10', stationNumber: 6, operationName: 'Waistband Prepare & Attach', machineType: 'SNLS', operatorName: 'Ganga S.', mechanicZone: 'Zone B' },
  { id: 'ws-10-7', lineId: 'line-10', stationNumber: 7, operationName: 'Belt Loop Bar Tack', machineType: 'BAR', operatorName: 'Hema D.', mechanicZone: 'Zone B' },
  { id: 'ws-10-8', lineId: 'line-10', stationNumber: 8, operationName: 'Bottom Hem', machineType: 'FL', operatorName: 'Indira P.', mechanicZone: 'Zone C' },
  { id: 'ws-10-9', lineId: 'line-10', stationNumber: 9, operationName: 'Zipper Box Tack', machineType: 'BAR', operatorName: 'Jayanthi N.', mechanicZone: 'Zone C' },
  { id: 'ws-10-10', lineId: 'line-10', stationNumber: 10, operationName: 'Label Attach', machineType: 'SNLS', operatorName: 'Kamakshi B.', mechanicZone: 'Zone C' },
];

export function generateKittingItems(changeoverEventId: string, workstations: Workstation[]): KittingItem[] {
  const items: KittingItem[] = [];
  const kittingTemplates: Record<string, Array<{ itemType: KittingItem['itemType']; itemName: string; quantity: number; unit: string }>> = {
    'SNLS': [
      { itemType: 'needle', itemName: 'Needle DB×1 #12', quantity: 5, unit: 'pcs' },
      { itemType: 'presser-foot', itemName: 'Standard Presser Foot', quantity: 1, unit: 'set' },
      { itemType: 'thread', itemName: 'Thread Cone (Main Color)', quantity: 2, unit: 'cone' },
    ],
    'DNLS': [
      { itemType: 'needle', itemName: 'Needle DP×5 #14', quantity: 4, unit: 'pcs' },
      { itemType: 'presser-foot', itemName: 'Double Needle Foot', quantity: 1, unit: 'set' },
      { itemType: 'thread', itemName: 'Thread Cone (Main Color)', quantity: 4, unit: 'cone' },
      { itemType: 'folder', itemName: 'Seam Guide Folder', quantity: 1, unit: 'pcs' },
    ],
    'OL': [
      { itemType: 'needle', itemName: 'Needle DC×1 #11', quantity: 3, unit: 'pcs' },
      { itemType: 'thread', itemName: 'Thread Cone (Overlock)', quantity: 4, unit: 'cone' },
    ],
    'FL': [
      { itemType: 'folder', itemName: 'Hem Turning Folder 1"', quantity: 1, unit: 'pcs' },
      { itemType: 'thread', itemName: 'Thread Cone (Hem Color)', quantity: 2, unit: 'cone' },
    ],
    'BAR': [
      { itemType: 'needle', itemName: 'Needle #14', quantity: 2, unit: 'pcs' },
      { itemType: 'thread', itemName: 'Thread Cone (Bartack)', quantity: 1, unit: 'cone' },
    ],
    'KAN': [
      { itemType: 'attachment', itemName: 'Kansai Loop Feeder', quantity: 1, unit: 'set' },
      { itemType: 'thread', itemName: 'Thread Cone (Loop Color)', quantity: 3, unit: 'cone' },
    ],
    'MANUAL': [
      { itemType: 'attachment', itemName: 'Button Clamp Set', quantity: 1, unit: 'set' },
    ],
  };

  workstations.forEach((ws) => {
    const templates = kittingTemplates[ws.machineType] || [];
    templates.forEach((t, idx) => {
      items.push({
        id: `kit-${changeoverEventId}-${ws.id}-${idx}`,
        changeoverEventId,
        workstationId: ws.id,
        itemType: t.itemType,
        itemName: t.itemName,
        quantity: t.quantity,
        unit: t.unit,
        status: 'pending',
        kittedByName: null,
        kittedAt: null,
        verifiedByName: null,
        verifiedAt: null,
      });
    });
  });
  return items;
}

export function generateOBEntries(changeoverEventId: string, workstations: Workstation[]): OBSheetEntry[] {
  return workstations.map((ws) => ({
    id: `ob-${changeoverEventId}-${ws.id}`,
    changeoverEventId,
    workstationId: ws.id,
    operatorName: ws.operatorName,
    distributed: false,
    distributedAt: null,
    receivedBySignature: null,
    distributedByIEName: null,
  }));
}

export function generateWIPEntries(changeoverEventId: string, lineId: string): WIPRunDownEntry[] {
  const subSections = ['Front Sub-Assembly', 'Back Sub-Assembly', 'Assembly', 'Finishing'];
  const hourSlots = ['13:00–14:00', '14:00–15:00', '15:00–16:00', '16:00–17:00', '17:00–17:30'];
  const targets: Record<string, number[]> = {
    'Front Sub-Assembly': [120, 80, 50, 20, 0],
    'Back Sub-Assembly': [100, 60, 40, 15, 0],
    'Assembly': [150, 100, 60, 25, 0],
    'Finishing': [80, 50, 30, 10, 0],
  };
  const entries: WIPRunDownEntry[] = [];
  subSections.forEach((section) => {
    hourSlots.forEach((slot, idx) => {
      entries.push({
        id: `wip-${changeoverEventId}-${lineId}-${section.replace(/\s/g, '')}-${idx}`,
        changeoverEventId,
        subSection: section,
        hourSlot: slot,
        targetWIP: targets[section][idx],
        actualWIP: null,
        status: 'not-logged',
        loggedByName: null,
        loggedAt: null,
      });
    });
  });
  return entries;
}

export function generateTasks(changeoverEventId: string): Task[] {
  const taskDefs: Array<Omit<Task, 'id' | 'changeoverEventId' | 'status' | 'doneByName' | 'doneAt' | 'signedOffByName' | 'signedOffByRole' | 'signedOffAt' | 'notes'>> = [
    { category: 'wip-run-down', description: 'Issue WIP run-down schedule to supervisor & sub-section heads', responsibleRole: 'ie-engineer', dueByTime: '13:00' },
    { category: 'mechanic-briefing', description: 'Brief mechanic team; issue zone assignments for changeover', responsibleRole: 'ie-engineer', dueByTime: '13:30' },
    { category: 'ob-distribution', description: 'Print & distribute OB sheets to all operators', responsibleRole: 'ie-engineer', dueByTime: '14:00' },
    { category: 'machine-setting-card', description: 'Prepare machine setting cards (needle, SPI, tension, presser foot) per operation', responsibleRole: 'ie-engineer', dueByTime: '14:30' },
    { category: 'layout-sheet', description: 'Issue line layout sheet for incoming style to supervisor & helpers', responsibleRole: 'ie-engineer', dueByTime: '14:00' },
    { category: 'qc-spec-sheet', description: 'Issue QC spec sheet with critical measurements to QC checker', responsibleRole: 'ie-engineer', dueByTime: '14:00' },
    { category: 'kitting', description: 'Complete kitting of all attachments, threads, presser feet, needles per workstation', responsibleRole: 'store-helper', dueByTime: '15:00' },
    { category: 'fabric-staging', description: 'Stage fabric & trims at line end before end of T-1 shift', responsibleRole: 'store-helper', dueByTime: '15:30' },
    { category: 'operator-demo', description: 'Conduct operation demonstrations to operators for new style operations', responsibleRole: 'supervisor', dueByTime: '16:00' },
  ];
  return taskDefs.map((def, idx) => ({
    id: `task-${changeoverEventId}-${idx}`,
    changeoverEventId,
    ...def,
    status: 'pending',
    doneByName: null,
    doneAt: null,
    signedOffByName: null,
    signedOffByRole: null,
    signedOffAt: null,
    notes: null,
  }));
}

export function createSeedChangeover(lineId: string): ChangeoverEvent {
  return {
    id: `co-seed-${lineId}`,
    lineId,
    date: '2026-05-07',
    t1Date: '2026-05-06',
    fromStyleId: 'style-001',
    toStyleId: 'style-002',
    shiftEndTime: '17:30',
    status: 'in-progress',
    overallSignedOffBy: null,
    overallSignedOffAt: null,
  };
}
