type WaterInput = {
  ph: number;
  tds: number;
  turbidity: number;
};

const history: any[] = [];

export function analyzeWater(data: WaterInput) {
  const reusable =
    data.ph >= 6.5 &&
    data.ph <= 8.5 &&
    data.tds <= 1000 &&
    data.turbidity <= 10;

  let bracket = "F1";
  if (data.tds > 1500) bracket = "F5";
  else if (data.tds > 1000) bracket = "F4";
  else if (data.turbidity > 30) bracket = "F3";
  else if (data.turbidity > 10) bracket = "F2";

  return { reusable: reusable ? "YES" : "NO", bracket };
}

export function saveHistory(entry: any) {
  history.push(entry);
}

export function getHistory() {
  return history;
}
