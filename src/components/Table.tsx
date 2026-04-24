import { ReactNode } from 'react';

export default function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="gradient-brand-soft border-y border-orange-200">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-800">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-orange-50">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 py-3 text-slate-700 ${className}`}>{children}</td>;
}
