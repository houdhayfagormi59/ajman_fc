import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'gradient-brand text-white shadow-glow-orange hover:opacity-90',
    secondary: 'card border hover:bg-brand-50 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-brand-50 dark:hover:bg-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={variant === 'secondary' || variant === 'ghost' ? { color: 'var(--text-primary)' } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
