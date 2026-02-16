export function ForecastChart() {
  return <div className="h-80 bg-black/30 rounded-2xl border border-white/10 p-4">24-Hour Forecast Chart</div>;
}

export function WeatherImpact() {
  return <div className="h-80 bg-black/30 rounded-2xl border border-white/10 p-4">Weather Impact Analysis</div>;
}

export function SeasonalChart() {
  return <div className="h-80 bg-black/30 rounded-2xl border border-white/10 p-4">Seasonal Distribution</div>;
}

export function AIInsights() {
  return (
    <div className="mt-8 p-6 rounded-2xl bg-black/30 border border-white/10">
      <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
      <ul className="list-disc pl-6 text-gray-400 space-y-1">
        <li>Peak demand expected at 18:00</li>
        <li>Weather conditions optimal</li>
        <li>Model confidence: 95%</li>
      </ul>
    </div>
  );
}
