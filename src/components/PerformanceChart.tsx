'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  rating: number;
  count?: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export default function PerformanceChart({ data, height = 200 }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-secondary)' }}>
      No data available
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text-primary)', fontSize: 12,
          }}
        />
        <Line
          type="monotone" dataKey="rating" stroke="#EA580C" strokeWidth={2.5}
          dot={{ fill: '#EA580C', r: 4 }} activeDot={{ r: 6 }}
          name="Avg Rating"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
