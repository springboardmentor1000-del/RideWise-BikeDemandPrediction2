export default function predictionResult({ result }) {
  const value = result.prediction;
  const percent = Math.min(Math.max((value / 600) * 100, 6), 100);

  return (
    <div className="result-card">
      <h2>Hour-wise AI Prediction</h2>

      <div className="stats">
        <div>
          <p>Predicted Demand</p>
          <h1>{value}</h1>
        </div>
        <div>
          <p>Model</p>
          <h3>Hour-wise ML</h3>
        </div>
        <div>
          <p>Hour</p>
          <h3>{result.hour}:00</h3>
        </div>
      </div>

      <div className="bar-section">
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="bar-label">
          {value > 300 ? "High Demand" : value > 120 ? "Medium Demand" : "Low Demand"}
        </p>
      </div>

      <div className="context-card">
        <h3>Hourly Context</h3>
        {[result.hour - 2, result.hour - 1, result.hour, result.hour + 1].map(
          (h, i) => (
            <div key={i} className="hour-row">
              <span>{((h + 24) % 24)}:00</span>
              <div className="mini-bar" />
            </div>
          )
        )}
      </div>
    </div>
  );
}
