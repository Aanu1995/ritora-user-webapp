/**
 * Shelf-life derivation.
 *
 * Pure function that maps a ShelfProduct's opened-on date, period-after-opening,
 * expiry date, and status into a live snapshot used by the UI:
 *
 * - state: the colour/label bucket (unopened, fresh, aging, expired, finished, archived)
 * - remainingFraction: [0, 1] used for progress-bar fill width
 * - remainingDays: integer days to expiry (negative when past)
 *
 * Thresholds:
 *   fresh   : >50% of shelf life remaining
 *   aging   : 0–50% remaining (amber)
 *   expired : past expiry (red)
 */

import type { ShelfLifeSnapshot, ShelfProduct } from '@/types/shelf';
import { ShelfLifeState, ShelfStatus } from '@/types/shelf';
import {
  diffInDaysRounded,
  parseUtcDate,
  utcNow,
} from '@/lib/dayjs';

/**
 * Compute the "effective" expiry date: prefer the explicit expiresAt, else
 * openedAt + PAO months, else null.
 */
export function computeExpiresAt(product: ShelfProduct): Date | null {
  const explicit = parseUtcDate(product.userFields.expiresAt);
  if (explicit) {
    return explicit.toDate();
  }

  const opened = parseUtcDate(product.userFields.openedAt);
  const pao = product.userFields.periodAfterOpeningMonths;
  if (opened && pao && pao > 0) {
    return opened.add(pao, 'month').toDate();
  }

  return null;
}

export function deriveShelfLife(
  product: ShelfProduct,
  now: Date = utcNow().toDate(),
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

  const opened = parseUtcDate(product.userFields.openedAt);
  if (!opened) {
    return {
      state: ShelfLifeState.Unopened,
      remainingFraction: 1,
      remainingDays: null,
    };
  }

  const expires = computeExpiresAt(product);
  if (!expires) {
    // Opened but no expiry or PAO known — treat as fresh with no progress info.
    return {
      state: ShelfLifeState.Fresh,
      remainingFraction: null,
      remainingDays: null,
    };
  }

  const totalDays = diffInDaysRounded(opened.toDate(), expires);
  const elapsedDays = diffInDaysRounded(opened.toDate(), now);
  const remainingDays = totalDays - elapsedDays;

  if (remainingDays <= 0) {
    return {
      state: ShelfLifeState.Expired,
      remainingFraction: 0,
      remainingDays,
    };
  }

  const fraction = totalDays > 0 ? Math.max(0, Math.min(1, remainingDays / totalDays)) : 0;
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
  now: Date = utcNow().toDate(),
): string | null {
  const opened = parseUtcDate(product.userFields.openedAt);
  if (!opened) {
    return null;
  }
  const days = Math.max(0, diffInDaysRounded(opened.toDate(), now));
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
