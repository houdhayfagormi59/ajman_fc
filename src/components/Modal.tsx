'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    function esc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) { document.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className={`card w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b flex items-center justify-between gradient-brand-soft" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
