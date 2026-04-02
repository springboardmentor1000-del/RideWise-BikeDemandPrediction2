export default function DemandBar({ value }) {
  const max = 600;
  const percent = Math.max((value / max) * 100, 5);

  let color = "#38bdf8";
  let label = "Low demand";

  if (value > 300) {
    color = "#22c55e";
    label = "High demand";
  } else if (value > 120) {
    color = "#facc15";
    label = "Medium demand";
  }

  return (
    <div>
      <div className="bar-bg">
        <div
          className="bar-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <p className="bar-label">{label}</p>
    </div>
  );
}
