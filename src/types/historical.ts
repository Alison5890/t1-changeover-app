export interface RampUpPoint {
  hour: number;      // Hour of Day 1 (1 = first hour after changeover complete)
  efficiency: number; // % of target efficiency achieved
  target: number;     // target efficiency for that hour
  piecesProduced: number;
}

export interface ActivityBreakdown {
  wipClearance: number;
  machineSetup: number;
  threadPrep: number;
  attachmentHandling: number;
  operatorDemo: number;
  fabricStaging: number;
  trialRun: number;
  layoutAdjustment: number;
}

export interface ChangeoverLog {
  id: string;
  date: string;               // ISO date e.g. '2026-04-20'
  lineId: string;
  fromStyleCode: string;
  toStyleCode: string;
  smedException: boolean;     // was SMED protocol followed?
  t1CompletionPct: number;    // % of T-1 tasks completed before changeover
  totalDurationMin: number;   // total changeover time in minutes
  internalTimeMin: number;    // time the line was stopped
  externalTimeSavedMin: number; // time saved by pre-prep vs baseline
  breakdown: ActivityBreakdown;
  rampUp: RampUpPoint[];       // hourly efficiency Day 1
  defectRatePct: number;       // first 50 pieces defect %
  notes: string;
  phase: 'baseline' | 'partial-smed' | 'full-smed'; // study phase
}
