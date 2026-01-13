import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SeasonalDistributionChart({ data }) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl">
      <h3 className="text-xl font-semibold text-white mb-4">
        Seasonal Distribution
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="season" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#22d3ee"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
