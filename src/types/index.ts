export type MachineType = 'SNLS' | 'DNLS' | 'OL' | 'FL' | 'BAR' | 'KAN' | 'MANUAL';

export type Role = 'ie-engineer' | 'supervisor' | 'mechanic' | 'store-helper' | 'qc-checker';

export type TaskCategory =
  | 'ob-distribution'
  | 'kitting'
  | 'wip-run-down'
  | 'operator-demo'
  | 'mechanic-briefing'
  | 'machine-setting-card'
  | 'fabric-staging'
  | 'layout-sheet'
  | 'qc-spec-sheet';

export type TaskStatus = 'pending' | 'done' | 'signed-off';
export type KittingStatus = 'pending' | 'kitted' | 'verified';
export type ItemType = 'attachment' | 'thread' | 'presser-foot' | 'folder' | 'needle';
export type RAGStatus = 'green' | 'amber' | 'red' | 'pending';
export type ChangeoverStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
export type WIPStatus = 'on-track' | 'behind' | 'ahead' | 'not-logged';

export interface Style {
  id: string;
  styleCode: string;
  productType: string;
  smv: number;
  totalOperations: number;
  createdAt: string;
}

export interface Line {
  id: string;
  lineNumber: number;
  name: string;
  supervisorName: string;
  shiftStartTime: string;
  shiftEndTime: string;
}

export interface Workstation {
  id: string;
  lineId: string;
  stationNumber: number;
  operationName: string;
  machineType: MachineType;
  operatorName: string;
  mechanicZone: string;
}

export interface ChangeoverEvent {
  id: string;
  lineId: string;
  date: string;
  t1Date: string;
  fromStyleId: string;
  toStyleId: string;
  shiftEndTime: string;
  status: ChangeoverStatus;
  overallSignedOffBy: string | null;
  overallSignedOffAt: string | null;
}

export interface KittingItem {
  id: string;
  changeoverEventId: string;
  workstationId: string;
  itemType: ItemType;
  itemName: string;
  quantity: number;
  unit: string;
  status: KittingStatus;
  kittedByName: string | null;
  kittedAt: string | null;
  verifiedByName: string | null;
  verifiedAt: string | null;
}

export interface OBSheetEntry {
  id: string;
  changeoverEventId: string;
  workstationId: string;
  operatorName: string;
  distributed: boolean;
  distributedAt: string | null;
  receivedBySignature: string | null;
  distributedByIEName: string | null;
}

export interface WIPRunDownEntry {
  id: string;
  changeoverEventId: string;
  subSection: string;
  hourSlot: string;
  targetWIP: number;
  actualWIP: number | null;
  status: WIPStatus;
  loggedByName: string | null;
  loggedAt: string | null;
}

export interface Task {
  id: string;
  changeoverEventId: string;
  category: TaskCategory;
  description: string;
  responsibleRole: Role;
  dueByTime: string;
  status: TaskStatus;
  doneByName: string | null;
  doneAt: string | null;
  signedOffByName: string | null;
  signedOffByRole: Role | null;
  signedOffAt: string | null;
  notes: string | null;
}

export interface SignOff {
  id: string;
  changeoverEventId: string;
  role: Role;
  name: string;
  category: TaskCategory | 'overall';
  timestamp: string;
  notes: string | null;
}

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  'ob-distribution': 'OB Sheet Distribution',
  'kitting': 'Kitting',
  'wip-run-down': 'WIP Run-Down',
  'operator-demo': 'Operator Demo',
  'mechanic-briefing': 'Mechanic Briefing',
  'machine-setting-card': 'Setting Cards',
  'fabric-staging': 'Fabric Staging',
  'layout-sheet': 'Layout Sheet',
  'qc-spec-sheet': 'QC Spec Sheet',
};

export const ROLE_LABELS: Record<Role, string> = {
  'ie-engineer': 'IE Engineer',
  'supervisor': 'Supervisor',
  'mechanic': 'Mechanic',
  'store-helper': 'Store Helper',
  'qc-checker': 'QC Checker',
};

export const ROLE_COLORS: Record<Role, string> = {
  'ie-engineer': 'bg-blue-100 text-blue-800',
  'supervisor': 'bg-purple-100 text-purple-800',
  'mechanic': 'bg-orange-100 text-orange-800',
  'store-helper': 'bg-green-100 text-green-800',
  'qc-checker': 'bg-pink-100 text-pink-800',
};
