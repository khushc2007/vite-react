export type Reading = {
  time: string;
  ph: number;
  tds: number;
  turbidity: number;
};

let readings: Reading[] = [];
let history: any[] = [];

export function addReading(r: Reading) {
  if (readings.length >= 10) return;
  readings.push(r);
}

export function getReadings() {
  return readings;
}

export function clearReadings() {
  readings = [];
}

export function saveIteration(iteration: any) {
  history.push(iteration);
}

export function getHistory() {
  return history;
}
