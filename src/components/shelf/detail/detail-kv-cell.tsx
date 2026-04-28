import type { ReactNode } from 'react';

type DetailKvCellProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

export function DetailKvCell({ icon, label, value }: DetailKvCellProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted p-2.5">
      <span className="mt-0.5 text-accent-strong">{icon}</span>
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
        <span className="text-[15px] font-semibold">{value}</span>
      </div>
    </div>
  );
}
