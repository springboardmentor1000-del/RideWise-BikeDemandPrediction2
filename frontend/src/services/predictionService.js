import { API_BASE } from "./api";

export async function predictDaily(payload) {
  const res = await fetch(`${API_BASE}/predict/daily`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function predictHourly(payload) {
  const res = await fetch(`${API_BASE}/predict/hourly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
