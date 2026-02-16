export default function NetworkSummary() {
  return (
    <div className="
      relative rounded-3xl p-6 space-y-5
     bg-purple-500/20
        border border-white/10
        backdrop-blur-md
        text-gray-200
    ">

      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl 
        bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
        blur-xl -z-10" />

      {/* Header */}
      <h3 className="text-lg font-semibold tracking-wide flex items-center gap-2">
        🌐 Network Summary
      </h3>

      {/* Stats */}
      <div className="space-y-4">

        {/* Total Stations */}
        <div className="flex items-center justify-between
          p-4 rounded-xl bg-white/5 border border-white/10
          hover:border-cyan-400/30 transition">
          <span className="text-gray-400 flex items-center gap-2">
            📍 Total Stations
          </span>
          <span className="text-xl font-bold text-white">
            70
          </span>
        </div>

        {/* Available Bikes */}
        <div className="flex items-center justify-between
          p-4 rounded-xl bg-white/5 border border-white/10
          hover:border-cyan-400/30 transition">
          <span className="text-gray-400 flex items-center gap-2">
            🚲 Available Bikes
          </span>
          <span className="text-xl font-bold text-cyan-400">
            816
          </span>
        </div>

        {/* High Demand */}
        <div className="flex items-center justify-between
          p-4 rounded-xl bg-white/5 border border-white/10
          hover:border-pink-400/30 transition">
          <span className="text-gray-400 flex items-center gap-2">
            🔥 High Demand Stations
          </span>
          <span className="text-xl font-bold text-pink-400">
            45
          </span>
        </div>

      </div>
    </div>
  );
}
