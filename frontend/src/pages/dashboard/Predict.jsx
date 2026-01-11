import { useState } from "react";
import {
  predictDaily,
  predictHourly
} from "../../services/predictionService";
import "../../styles/dashboard.css";

export default function Predict() {
  /* ================= MODE ================= */
  const [mode, setMode] = useState("daily"); // daily | hourly

  /* ================= INPUT STATE ================= */
  const [season, setSeason] = useState(2);
  const [weather, setWeather] = useState(1);
  const [temp, setTemp] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [wind, setWind] = useState(10);
  const [hour, setHour] = useState(12);
  const [workingDay, setWorkingDay] = useState(true);

  /* ================= OUTPUT STATE ================= */
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= HANDLER ================= */
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      /* ✅ BASE PAYLOAD (COMMON FEATURES ONLY) */
      const basePayload = {
        season,
        weather,
        temp: temp / 41,
        humidity: humidity / 100,
        windspeed: wind / 67,
        is_weekend: workingDay ? 0 : 1
      };

      /* ✅ DAILY MODEL */
      if (mode === "daily") {
        const daily = await predictDaily(basePayload);
        setResult({
          type: "Daily",
          value: daily
        });
      }

      /* ✅ HOURLY MODEL */
      if (mode === "hourly") {
        const hourly = await predictHourly({
          ...basePayload,
          hour
        });
        setResult({
          type: "Hourly",
          value: hourly,
          hour
        });
      }
    } catch (err) {
      setError("Prediction failed. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Demand Prediction</h1>
      <p className="page-subtitle">
        Separate ML models for daily and hourly bike demand forecasting
      </p>

      {/* ================= MODE TOGGLE ================= */}
      <div className="tab-row">
        <button
          className={mode === "daily" ? "tab active" : "tab"}
          onClick={() => setMode("daily")}
        >
          Daily Prediction
        </button>
        <button
          className={mode === "hourly" ? "tab active" : "tab"}
          onClick={() => setMode("hourly")}
        >
          Hourly Prediction
        </button>
      </div>

      <div className="predict-grid">
        {/* ================= INPUT CARD ================= */}
        <div className="card">
          <h3>{mode === "daily" ? "Daily Inputs" : "Hourly Inputs"}</h3>

          <label>Season</label>
          <select value={season} onChange={(e) => setSeason(+e.target.value)}>
            <option value={1}>Spring</option>
            <option value={2}>Summer</option>
            <option value={3}>Fall</option>
            <option value={4}>Winter</option>
          </select>

          <label>Weather</label>
          <select value={weather} onChange={(e) => setWeather(+e.target.value)}>
            <option value={1}>Clear</option>
            <option value={2}>Mist</option>
            <option value={3}>Rain</option>
            <option value={4}>Storm</option>
          </select>

          <label>Temperature: {temp}°C</label>
          <input
            type="range"
            min="0"
            max="41"
            value={temp}
            onChange={(e) => setTemp(+e.target.value)}
          />

          <label>Humidity: {humidity}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={humidity}
            onChange={(e) => setHumidity(+e.target.value)}
          />

          <label>Wind Speed: {wind} km/h</label>
          <input
            type="range"
            min="0"
            max="67"
            value={wind}
            onChange={(e) => setWind(+e.target.value)}
          />

          {mode === "hourly" && (
            <>
              <label>Hour of Day: {hour}:00</label>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(+e.target.value)}
              />
            </>
          )}

          <label>Day Type</label>
          <div className="toggle-row">
            <button
              type="button"
              className={workingDay ? "pill active" : "pill"}
              onClick={() => setWorkingDay(true)}
            >
              Working Day
            </button>
            <button
              type="button"
              className={!workingDay ? "pill active" : "pill"}
              onClick={() => setWorkingDay(false)}
            >
              Non-Working Day
            </button>
          </div>

          <button className="primary-btn" onClick={handlePredict}>
            {loading ? "Predicting..." : "Run Prediction"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {/* ================= OUTPUT CARD ================= */}
        <div className="card">
          <h3>Prediction Result</h3>

          {!result ? (
            <div className="placeholder">
              📊 Adjust inputs and run prediction
            </div>
          ) : (
            <div className="result-box big">
              <span>
                {result.type} Demand
                {result.type === "Hourly" && ` (${result.hour}:00)`}
              </span>
              <strong>{result.value}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
