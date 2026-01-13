export default function SummaryCards({ data }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="card">
        <p className="text-gray-400">Predicted Demand</p>
        <h2 className="text-3xl font-bold text-cyan-400">
          {data.total_prediction}
        </h2>
      </div>

      <div className="card">
        <p className="text-gray-400">Model</p>
        <h2 className="text-xl">Day-wise ML</h2>
      </div>

      <div className="card">
        <p className="text-gray-400">Status</p>
        <h2 className="text-xl text-green-400">High Confidence</h2>
      </div>
    </div>
  );
}
