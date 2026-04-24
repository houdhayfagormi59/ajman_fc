import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  accent?: boolean;
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow';
}

const colorMap = {
  default: 'text-brand-600',
  green: 'text-emerald-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
};

export default function StatCard({ label, value, icon, hint, accent = false, color = 'default' }: Props) {
  return (
    <div className={cn('card p-4', accent ? 'gradient-brand-soft' : '')}>
      <div className="flex items-center justify-between mb-1">
        <span className="label text-[10px]">{label}</span>
        {icon && <span className="text-brand-500">{icon}</span>}
      </div>
      <div className={cn('text-2xl font-extrabold', colorMap[color])}>{value}</div>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{hint}</div>}
    </div>
  );
}
