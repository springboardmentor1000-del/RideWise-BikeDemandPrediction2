export function generateHourlyForecast(basePrediction) {
  // Hour-wise weight pattern (realistic bike usage)
  const hourlyWeights = [
    0.2, 0.15, 0.12, 0.1, 0.12, 0.25, // 0–5
    0.6, 0.9, 1.1, 1.0, 0.95, 0.9,  // 6–11
    0.85, 0.8, 0.75, 0.8, 0.9, 1.1, // 12–17
    1.4, 1.3, 1.0, 0.8, 0.5, 0.3   // 18–23
  ];

  return hourlyWeights.map((weight, hour) => ({
    hour: `${hour}:00`,
    demand: Math.round(basePrediction * weight)
  }));
}
