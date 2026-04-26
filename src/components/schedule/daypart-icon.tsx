import { Moon, Sun, Sunrise } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Daypart } from '@/types/schedule';
import { cn } from '@/lib/utils';

type DaypartTone = {
  icon: typeof Sun;
  wrapperStyle: CSSProperties;
  textVar: string;
  badgeStyle: CSSProperties;
  noteStyle: CSSProperties;
  accentVar: string;
};

export const DAYPART_TONES: Record<Daypart, DaypartTone> = {
  morning: {
    icon: Sunrise,
    wrapperStyle: {
      backgroundColor: 'var(--daypart-morning-bg)',
      color: 'var(--daypart-morning-fg)',
    },
    textVar: 'var(--daypart-morning-fg)',
    badgeStyle: {
      backgroundColor: 'var(--daypart-morning-bg)',
      color: 'var(--daypart-morning-fg)',
    },
    noteStyle: {
      backgroundColor: 'var(--note-warm-bg)',
      color: 'var(--note-warm-fg)',
      borderLeftColor: 'var(--note-warm-border)',
    },
    accentVar: 'var(--daypart-morning-accent)',
  },
  afternoon: {
    icon: Sun,
    wrapperStyle: {
      backgroundColor: 'var(--daypart-noon-bg)',
      color: 'var(--daypart-noon-fg)',
    },
    textVar: 'var(--daypart-noon-fg)',
    badgeStyle: {
      backgroundColor: 'var(--daypart-noon-bg)',
      color: 'var(--daypart-noon-fg)',
    },
    noteStyle: {
      backgroundColor: 'var(--note-warm-bg)',
      color: 'var(--note-warm-fg)',
      borderLeftColor: 'var(--note-warm-border)',
    },
    accentVar: 'var(--daypart-noon-accent)',
  },
  evening: {
    icon: Moon,
    wrapperStyle: {
      backgroundColor: 'var(--daypart-evening-bg)',
      color: 'var(--daypart-evening-fg)',
    },
    textVar: 'var(--daypart-evening-fg)',
    badgeStyle: {
      backgroundColor: 'var(--daypart-evening-bg)',
      color: 'var(--daypart-evening-fg)',
    },
    noteStyle: {
      backgroundColor: 'var(--note-cool-bg)',
      color: 'var(--note-cool-fg)',
      borderLeftColor: 'var(--note-cool-border)',
    },
    accentVar: 'var(--daypart-evening-accent)',
  },
};

type DaypartIconProps = {
  daypart: Daypart;
  size?: 'sm' | 'md';
  className?: string;
};

export function DaypartIcon({
  daypart,
  size = 'md',
  className,
}: DaypartIconProps) {
  const tone = DAYPART_TONES[daypart];
  const Icon = tone.icon;
  return (
    <span
      aria-hidden
      style={tone.wrapperStyle}
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </span>
  );
}
