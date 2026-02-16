import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function HourlyForecastChart({ data }) {
  return (
    <div
      className="
        w-full
        p-8
        rounded-3xl
        backdrop-blur-xl
        bg-gradient-to-b from-[#0b1220]/90 to-[#060b16]/90
        border border-white/10
        shadow-2xl
      "
    >
      <h3 className="text-2xl font-semibold text-white mb-6">
        24-Hour Forecast
      </h3>

      {/* 👇 height increased */}
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
        >
          {/* Grid */}
          <CartesianGrid
            stroke="#1f2937"
            strokeDasharray="3 6"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Tooltip */}
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: "12px",
              border: "1px solid #334155",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}
            labelStyle={{ color: "#e5e7eb", marginBottom: 6 }}
            itemStyle={{ fontSize: 14 }}
          />

          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: "20px",
              color: "#e5e7eb",
            }}
          />

          {/* Predicted */}
          <Line
            type="monotone"
            dataKey="predicted"
            name="predicted"
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{
              r: 4,
              stroke: "#e0f2fe",
              strokeWidth: 2,
              fill: "#22d3ee",
            }}
            activeDot={{
              r: 7,
              stroke: "#e0f2fe",
              strokeWidth: 2,
              fill: "#22d3ee",
            }}
          />

          {/* Actual (dashed) */}
          <Line
            type="monotone"
            dataKey="actual"
            name="actual"
            stroke="#c084fc"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={{
              r: 4,
              stroke: "#f5d0fe",
              strokeWidth: 2,
              fill: "#c084fc",
            }}
            activeDot={{
              r: 7,
              stroke: "#f5d0fe",
              strokeWidth: 2,
              fill: "#c084fc",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
