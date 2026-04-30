import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export function NavBadge({ count, max = 99, className }: NavBadgeProps) {
  if (count <= 0) return null;
  const display = count > max ? `${max}+` : String(count);
  return (
    <span
      className={cn(
        "ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-none text-white",
        className,
      )}
      aria-label={`${count} unread`}
    >
      {display}
    </span>
  );
}
