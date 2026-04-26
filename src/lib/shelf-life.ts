import { Temporal } from '@js-temporal/polyfill';
import type { ShelfLifeSnapshot, ShelfProduct } from '@/types/shelf';
import { ShelfLifeState, ShelfStatus } from '@/types/shelf';
import {
  diffShelfCalendarDays,
  parseShelfPlainDate,
  resolveShelfToday,
  toShelfStoredIsoString,
  type ShelfNowInput,
} from '@/lib/shelf-date';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';

export type ShelfLifeOptions = {
  now?: ShelfNowInput;
  timeZone?: string;
};

function computeExpiresPlainDate(product: ShelfProduct): Temporal.PlainDate | null {
  const explicit = parseShelfPlainDate(product.userFields.expiresAt);
  if (explicit) {
    return explicit;
  }

  const opened = parseShelfPlainDate(product.userFields.openedAt);
  const pao = product.userFields.periodAfterOpeningMonths;
  if (opened && pao && pao > 0) {
    return opened.add({ months: pao });
  }

  return null;
}

/**
 * Compute the "effective" expiry date: prefer the explicit expiresAt, else
 * openedAt + PAO months, else null.
 */
export function computeExpiresAt(product: ShelfProduct): string | null {
  const expires = computeExpiresPlainDate(product);
  return expires ? toShelfStoredIsoString(expires) : null;
}

export function deriveShelfLife(
  product: ShelfProduct,
  options: ShelfLifeOptions = {},
): ShelfLifeSnapshot {
  if (product.status === ShelfStatus.Archived) {
    return {
      state: ShelfLifeState.Archived,
      remainingFraction: null,
      remainingDays: null,
    };
  }

  if (product.status === ShelfStatus.FinishedUp) {
    return {
      state: ShelfLifeState.Finished,
      remainingFraction: null,
      remainingDays: null,
    };
  }

  const opened = parseShelfPlainDate(product.userFields.openedAt);
  if (!opened) {
    return {
      state: ShelfLifeState.Unopened,
      remainingFraction: 1,
      remainingDays: null,
    };
  }

  const expires = computeExpiresPlainDate(product);
  if (!expires) {
    return {
      state: ShelfLifeState.Fresh,
      remainingFraction: null,
      remainingDays: null,
    };
  }

  const totalDays = diffShelfCalendarDays(opened, expires);
  const today = resolveShelfToday(
    options.timeZone ?? DEFAULT_TIME_ZONE,
    options.now,
  );
  const elapsedDays = Math.max(0, diffShelfCalendarDays(opened, today));
  const remainingDays = totalDays - elapsedDays;

  if (remainingDays <= 0) {
    return {
      state: ShelfLifeState.Expired,
      remainingFraction: 0,
      remainingDays,
    };
  }

  const fraction =
    totalDays > 0 ? Math.max(0, Math.min(1, remainingDays / totalDays)) : 0;
  const state = fraction > 0.5 ? ShelfLifeState.Fresh : ShelfLifeState.Aging;

  return {
    state,
    remainingFraction: fraction,
    remainingDays,
  };
}

export function formatRemainingToken(snapshot: ShelfLifeSnapshot): string {
  if (snapshot.state === ShelfLifeState.Unopened) {
    return 'Unopened';
  }
  if (snapshot.state === ShelfLifeState.Archived) {
    return 'Archived';
  }
  if (snapshot.state === ShelfLifeState.Finished) {
    return 'Finished';
  }
  if (snapshot.state === ShelfLifeState.Expired) {
    return 'Expired';
  }
  if (snapshot.remainingDays === null) {
    return '';
  }

  const days = snapshot.remainingDays;
  if (days < 14) {
    return `${Math.max(1, days)}d`;
  }
  if (days < 60) {
    return `${Math.round(days / 7)}w`;
  }
  if (days < 730) {
    return `${Math.round(days / 30)}mo`;
  }
  return `${Math.round(days / 365)}y`;
}

/**
 * "Opened 3 weeks ago" compact token — a duration from openedAt to now.
 */
export function formatOpenedToken(
  product: ShelfProduct,
  options: ShelfLifeOptions = {},
): string | null {
  const opened = parseShelfPlainDate(product.userFields.openedAt);
  if (!opened) {
    return null;
  }

  const today = resolveShelfToday(
    options.timeZone ?? DEFAULT_TIME_ZONE,
    options.now,
  );
  const days = Math.max(0, diffShelfCalendarDays(opened, today));
  if (days < 1) {
    return 'today';
  }
  if (days < 14) {
    return `${days}d`;
  }
  if (days < 60) {
    return `${Math.round(days / 7)}w`;
  }
  if (days < 730) {
    return `${Math.round(days / 30)}mo`;
  }
  return `${Math.round(days / 365)}y`;
}
