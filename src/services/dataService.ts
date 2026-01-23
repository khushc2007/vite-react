// src/services/dataService.ts

export type Reading = {
  sl: number;
  time: string;
  ph: number;
  tds: number;
  turbidity: number;
};

export type Iteration = {
  name: string;
  createdAt: string;
  readings: Reading[];
};

let readings: Reading[] = [];
let history: Iteration[] = [];

const MAX_ROWS = 10;

/* ---------- LIVE DATA ---------- */
export function addReading(r: Omit<Reading, "sl">) {
  if (readings.length >= MAX_ROWS) return;

  readings.push({
    sl: readings.length + 1,
    ...r,
  });
}

export function getReadings(): Reading[] {
  return readings;
}

export function clearReadings() {
  readings = [];
}

/* ---------- HISTORY ---------- */
export function saveIteration(name: string) {
  history.push({
    name,
    createdAt: new Date().toLocaleString(),
    readings: [...readings],
  });
}

export function getHistory(): Iteration[] {
  return history;
}

/* ---------- HELPERS ---------- */
export function canRunPrediction(): boolean {
  return readings.length === MAX_ROWS;
}
