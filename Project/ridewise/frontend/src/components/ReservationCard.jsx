export default function ReservationCard({ data }) {
  const statusColor =
    data.status === "Active"
      ? "bg-cyan-500/20 text-cyan-400"
      : "bg-purple-500/20 text-purple-400";

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-black/20
      flex justify-between items-center">
      
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-3">
          {data.station}
          <span className={`text-xs px-3 py-1 rounded-full ${statusColor}`}>
            {data.status}
          </span>
        </h3>

        <div className="text-gray-400 text-sm mt-2 flex gap-6">
          <span>📅 {data.date}</span>
          <span>⏰ {data.time} ({data.duration})</span>
          <span>🚲 {data.bikeId}</span>
        </div>
      </div>

      {data.status === "Active" && (
        <button className="text-red-400 hover:text-red-300">
          ✖ Cancel
        </button>
      )}
    </div>
  );
}
