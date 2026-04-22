import { Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SlotMode } from '@/types/schedule';

export function ModeBadge({ mode }: { mode: SlotMode }) {
  const t = useTranslations('schedule.mode');
  const isManual = mode === SlotMode.Manual;
  const Icon = isManual ? User : Sparkles;
  const style = isManual
    ? {
        backgroundColor: 'var(--accent-soft)',
        color: 'var(--accent-strong)',
      }
    : {
        backgroundColor: 'var(--ai-bg)',
        color: 'var(--ai-fg)',
      };
  return (
    <span
      style={style}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
    >
      <Icon className="h-3 w-3" />
      {isManual ? t('manual') : t('ai')}
    </span>
  );
}
