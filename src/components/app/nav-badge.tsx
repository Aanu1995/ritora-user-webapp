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
        "ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1.5 py-px text-[10px] font-bold leading-none text-white",
        className,
      )}
      aria-label={`${count} unread`}
    >
      {display}
    </span>
  );
}
