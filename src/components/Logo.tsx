'use client';
interface Props {
  size?: number;
  className?: string;
  withText?: boolean;
}

export default function Logo({ size = 40, className = '', withText = false }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden shadow-glow-orange bg-white"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ajman-logo.png" alt="Ajman Club" className="w-full h-full object-cover" />
      </div>
      {withText && (
        <div>
          <div className="font-extrabold text-brand-700 leading-tight tracking-tight">Ajman FC Coach</div>
          <div className="text-[10px] text-brand-600/70 font-semibold uppercase tracking-widest leading-tight">
            Pro v2.0
          </div>
        </div>
      )}
    </div>
  );
}
