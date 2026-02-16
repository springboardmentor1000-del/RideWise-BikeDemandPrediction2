import { useState } from "react";

export default function HourInputCard({ onPredict }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    hour: 9,
    temperature: 20,
    humidity: 60,
    windspeed: 10,
    weathersit: 1,
    holiday: 0,
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="w-full w-[380px] rounded-2xl p-6
      bg-gradient-to-b from-[#2b124c] to-[#1b0a2f]
      shadow-[0_0_40px_rgba(160,90,255,0.35)]
      text-white">

      {/* Title */}
      <h2 className="text-center text-xl tracking-wide mb-6">
        Input Features
      </h2>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200 mb-1">
          Date
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className="w-full rounded-xl px-3 py-2
            bg-black/40 text-white outline-none"
        />
      </div>

      {/* Hour */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200 mb-1">
          Hour: {form.hour}:00
        </label>
        <input
          type="range"
          min="0"
          max="23"
          value={form.hour}
          onChange={(e) => update("hour", +e.target.value)}
          className="w-full accent-cyan-400"
        />
      </div>

      {/* Weather */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200 mb-1">
          Weather Condition
        </label>
        <select
          value={form.weathersit}
          onChange={(e) => update("weathersit", +e.target.value)}
          className="w-full rounded-xl px-3 py-2
            bg-black/40 text-white outline-none">
          <option value={1}>Clear</option>
          <option value={2}>Cloudy</option>
          <option value={3}>Rain</option>
        </select>
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200 mb-1">
          Temperature: {form.temperature}°C
        </label>
        <input
          type="range"
          min="0"
          max="45"
          value={form.temperature}
          onChange={(e) => update("temperature", +e.target.value)}
          className="w-full accent-cyan-400"
        />
      </div>

      {/* Humidity */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200 mb-1">
          Humidity: {form.humidity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={form.humidity}
          onChange={(e) => update("humidity", +e.target.value)}
          className="w-full accent-cyan-400"
        />
      </div>

      {/* Wind */}
      <div className="mb-5">
        <label className="block text-sm text-purple-200 mb-1">
          Wind Speed: {form.windspeed} km/h
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={form.windspeed}
          onChange={(e) => update("windspeed", +e.target.value)}
          className="w-full accent-cyan-400"
        />
      </div>

      {/* Holiday */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          onChange={(e) => update("holiday", e.target.checked ? 1 : 0)}
          className="w-4 h-4 accent-purple-500"
        />
        <span className="text-sm text-purple-200">
          Weekend / Holiday
        </span>
      </div>

      {/* Button */}
      <button
        onClick={() => onPredict(form)}
        className="w-full py-3 rounded-xl font-semibold text-black
          bg-gradient-to-r from-cyan-400 to-purple-400
          hover:shadow-[0_0_20px_rgba(180,120,255,0.7)]
          hover:-translate-y-0.5 transition-all">
        Predict Rentals
      </button>
    </div>
  );
}
