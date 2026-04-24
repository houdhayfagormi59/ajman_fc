'use client';
import { PieChart as ReChartsPie, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  title?: string;
}

const defaultColors = ['#EA580C', '#FB923C', '#FDBA74', '#FED7AA', '#C2410C', '#9A3412', '#7C2D12'];

export default function PieChart({ data, colors = defaultColors, title }: PieChartProps) {
  if (!data.length) return <p className="text-sm text-slate-500 text-center py-6">No data to display.</p>;

  return (
    <div className="w-full">
      {title && <h3 className="font-bold text-brand-800 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <ReChartsPie data={data}>
          <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value} />
          <Legend />
        </ReChartsPie>
      </ResponsiveContainer>
    </div>
  );
}
