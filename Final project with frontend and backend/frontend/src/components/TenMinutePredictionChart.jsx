import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TenMinutePredictionChart({ data }) {
  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="slot" stroke="#c4b5fd" />
          <YAxis
            allowDecimals={false}
            domain={[0, "dataMax + 1"]}
            stroke="#c4b5fd"
          />
          <Tooltip />
          <Bar dataKey="rentals" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
    