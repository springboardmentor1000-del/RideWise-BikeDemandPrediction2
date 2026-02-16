import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#22d3ee", "#a78bfa", "#fb7185"];

export default function WeatherImpactPie({ data }) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl">
      <h3 className="text-xl font-semibold text-white mb-4">
        Weather Impact Analysis
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
            
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
