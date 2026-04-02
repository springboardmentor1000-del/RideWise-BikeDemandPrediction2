import GlassCard from "./GlassCard";

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        ["Next 24h", "8961"],
        ["Peak Hour", "05:00 PM"],
        ["Peak Demand", "660"],
        ["Confidence", "95%"]
      ].map(([label, value]) => (
        <GlassCard key={label}>
          <p className="text-gray-400">{label}</p>
          <h2 className="text-3xl font-bold text-cyan-400">
            {value}
          </h2>
        </GlassCard>
      ))}
    </div>
  );
}
