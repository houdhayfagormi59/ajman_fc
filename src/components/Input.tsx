'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={cn('input-base', error && 'border-red-500', className)} {...props} />
    {error && <span className="text-xs text-red-600">{error}</span>}
  </div>
));
Input.displayName = 'Input';
export default Input;
