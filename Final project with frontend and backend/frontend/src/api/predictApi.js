export async function predictHourly(payload) {
  const res = await fetch("http://localhost:5000/api/predict/hourly", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}
