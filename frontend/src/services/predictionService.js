const API = "http://127.0.0.1:8000";

/* ---------- DAILY ---------- */
export async function predictDaily(payload) {
  const res = await fetch(`${API}/predict/daily`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      season: payload.season,
      weather: payload.weather,
      temp: payload.temp,
      humidity: payload.humidity,
      windspeed: payload.windspeed,
      is_weekend: payload.is_weekend
    })
  });

  if (!res.ok) throw new Error("Daily prediction failed");
  const data = await res.json();
  return data.predicted_daily_demand;
}

/* ---------- HOURLY ---------- */
export async function predictHourly(payload) {
  const res = await fetch(`${API}/predict/hourly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      season: payload.season,
      weather: payload.weather,
      temp: payload.temp,
      humidity: payload.humidity,
      windspeed: payload.windspeed,
      is_weekend: payload.is_weekend,
      hour: payload.hour
    })
  });

  if (!res.ok) throw new Error("Hourly prediction failed");
  const data = await res.json();
  return data.predicted_hourly_demand;
}
