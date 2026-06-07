'use client';

import { MapPin, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDeviceTimeZone } from '@/hooks/use-device-time-zone';
import { useUpdateTimeZone } from '@/hooks/use-auth';
import {
  acknowledgeTimeZoneMismatch,
  clearAcknowledgedTimeZoneMismatches,
  formatTimeZoneLabel,
  hasAcknowledgedTimeZoneMismatch,
} from '@/lib/time-zone';
import { resolveTimeZoneMismatchState } from '@/lib/time-zone.utils';
import { useAuthStore } from '@/stores/auth-store';

export function TimeZoneMismatchNotice() {
  const t = useTranslations('settings.timeZoneMismatch');
  const tCommon = useTranslations('common');
  const user = useAuthStore((state) => state.user);
  const updateTimeZone = useUpdateTimeZone();
  const deviceTimeZone = useDeviceTimeZone();
  const [dismissedMismatchKey, setDismissedMismatchKey] = useState<
    string | null
  >(null);

  const mismatchState = resolveTimeZoneMismatchState({
    deviceTimeZone,
    dismissedMismatchKey,
    hasAcknowledgedMismatch: hasAcknowledgedTimeZoneMismatch,
    savedTimeZone: user?.timeZone,
  });
  const { deviceTimeZone: currentDeviceTimeZone, mismatchKey, savedTimeZone } =
    mismatchState;

  if (
    !savedTimeZone ||
    !currentDeviceTimeZone ||
    !mismatchState.shouldShow ||
    !mismatchKey
  ) {
    return null;
  }

  const handleKeep = () => {
    acknowledgeTimeZoneMismatch(savedTimeZone, currentDeviceTimeZone);
    setDismissedMismatchKey(mismatchKey);
  };

  const handleSwitch = () => {
    updateTimeZone.mutate(
      { timeZone: currentDeviceTimeZone },
      {
        onSuccess: () => {
          clearAcknowledgedTimeZoneMismatches();
          setDismissedMismatchKey(null);
          toast.success(
            t('switched', {
              timeZone: formatTimeZoneLabel(currentDeviceTimeZone),
            }),
          );
        },
        onError: () => {
          toast.error(t('switchFailed'));
        },
      },
    );
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-5xl rounded-2xl border border-accent/20 bg-accent-soft/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-accent-strong" />
            {t('title')}
          </div>
          <p className="mt-1 text-sm text-muted">
            {t('body', {
              savedTimeZone: formatTimeZoneLabel(savedTimeZone),
              deviceTimeZone: formatTimeZoneLabel(currentDeviceTimeZone),
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleKeep}
            disabled={updateTimeZone.isPending}
          >
            {t('keep')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSwitch}
            disabled={updateTimeZone.isPending}
          >
            {updateTimeZone.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              t('switch', {
                deviceTimeZone: formatTimeZoneLabel(currentDeviceTimeZone),
              })
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
