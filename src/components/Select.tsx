'use client';
import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; children: ReactNode; }

const Select = forwardRef<HTMLSelectElement, Props>(({ label, className, children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={cn('input-base', className)} {...props}>{children}</select>
  </div>
));
Select.displayName = 'Select';
export default Select;
