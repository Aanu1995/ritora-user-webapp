'use client';

import { Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SlotMode } from '@/types/schedule';
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from '@/hooks/use-user-capabilities';
import { cn } from '@/lib/utils';
import { ScheduleAiConsentNudge } from './schedule-ai-consent-nudge';

type SlotModeToggleProps = {
  value: SlotMode;
  onChange: (mode: SlotMode) => void;
};

export function SlotModeToggle({ value, onChange }: SlotModeToggleProps) {
  const t = useTranslations('schedule.mode');
  const capabilities = useUserCapabilities();
  const aiDisabled = isCapabilityDisabled(capabilities.aiGeneration);
  return (
    <>
      <div
        role="radiogroup"
        aria-label={t('manual')}
        className="grid grid-cols-2 gap-2"
      >
        {[SlotMode.Manual, SlotMode.AI].map((mode) => {
          const selected = value === mode;
          const Icon = mode === SlotMode.Manual ? User : Sparkles;
          const disabled = mode === SlotMode.AI && aiDisabled;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(mode)}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
                selected
                  ? 'border-accent bg-accent-soft'
                  : 'border-border bg-surface hover:border-accent/60',
              )}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="h-4 w-4" aria-hidden />
                {mode === SlotMode.Manual ? t('manual') : t('ai')}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {mode === SlotMode.Manual
                  ? t('manualDescription')
                  : t('aiDescription')}
              </div>
            </button>
          );
        })}
      </div>
      {value === SlotMode.AI ? (
        <ScheduleAiConsentNudge disabled={aiDisabled} />
      ) : null}
    </>
  );
}
