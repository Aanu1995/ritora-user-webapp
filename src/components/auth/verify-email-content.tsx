'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useRef, useState } from 'react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useActionToken } from '@/hooks/use-action-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { verifyEmail } from '@/services/auth.service';

type VerifyEmailContentProps = {
  tokenFromRoute?: string | null;
};

export const VERIFY_EMAIL_ACTION_TIMEOUT_MS = 30000;

enum VerifyEmailActionStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

class VerifyEmailActionTimeoutError extends Error {
  constructor() {
    super('Email verification request timed out');
    this.name = 'VerifyEmailActionTimeoutError';
  }
}

type VerifyEmailActionState = {
  actionKey: string | null;
  status: VerifyEmailActionStatus;
  error: unknown;
};

const INITIAL_ACTION_STATE: VerifyEmailActionState = {
  actionKey: null,
  status: VerifyEmailActionStatus.Idle,
  error: null,
};

const inFlightVerifyEmailActions = new Map<string, Promise<void>>();

function runVerifyEmailAction(token: string): Promise<void> {
  const inFlightAction = inFlightVerifyEmailActions.get(token);

  if (inFlightAction) {
    return inFlightAction;
  }

  const operation = verifyEmail(token).then(() => undefined);
  inFlightVerifyEmailActions.set(token, operation);
  operation.then(
    () => {
      inFlightVerifyEmailActions.delete(token);
    },
    () => {
      inFlightVerifyEmailActions.delete(token);
    },
  );

  return operation;
}

function clearInFlightVerifyEmailAction(token: string): void {
  inFlightVerifyEmailActions.delete(token);
}

function withVerifyEmailActionTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeout: number | null = null;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = window.setTimeout(() => {
      reject(new VerifyEmailActionTimeoutError());
    }, VERIFY_EMAIL_ACTION_TIMEOUT_MS);
  });

  return Promise.race([operation, timeoutPromise]).finally(() => {
    if (timeout) {
      window.clearTimeout(timeout);
    }
  });
}

function VerifyEmailInner({
  tokenFromRoute = null,
}: VerifyEmailContentProps) {
  const t = useTranslations('auth');
  const actionToken = useActionToken();
  const activeActionRef = useRef(0);
  const [actionState, setActionState] =
    useState<VerifyEmailActionState>(INITIAL_ACTION_STATE);
  const [retryCount, setRetryCount] = useState(0);

  const token = tokenFromRoute?.trim() || actionToken.token;
  const isReady = tokenFromRoute !== null ? true : actionToken.isReady;
  const actionKey = isReady && token ? `${token}:${retryCount}` : null;
  const visibleActionStatus =
    actionKey && actionState.actionKey !== actionKey
      ? VerifyEmailActionStatus.Pending
      : actionState.status;

  useEffect(() => {
    if (!actionKey || !token) {
      return;
    }

    let isCurrentActionMounted = true;
    activeActionRef.current += 1;
    const actionId = activeActionRef.current;

    void withVerifyEmailActionTimeout(runVerifyEmailAction(token))
      .then(() => {
        if (!isCurrentActionMounted || activeActionRef.current !== actionId) {
          return;
        }

        setActionState({
          actionKey,
          status: VerifyEmailActionStatus.Success,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!isCurrentActionMounted || activeActionRef.current !== actionId) {
          return;
        }

        setActionState({
          actionKey,
          status: VerifyEmailActionStatus.Error,
          error,
        });
      });

    return () => {
      isCurrentActionMounted = false;
    };
  }, [actionKey, token]);

  const retryAction = () => {
    if (token) {
      clearInFlightVerifyEmailAction(token);
    }
    setRetryCount((current) => current + 1);
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <LoadingIndicator />
        <p className="text-sm text-muted">{t('loading')}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-danger">{t('invalidVerificationToken')}</p>
        <p className="text-sm text-muted">
          {t('invalidVerificationTokenHelp')}
        </p>
        <Link
          href={AppRoute.ResendVerification}
          className="inline-block text-sm font-semibold text-accent hover:underline"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (
    visibleActionStatus === VerifyEmailActionStatus.Idle ||
    visibleActionStatus === VerifyEmailActionStatus.Pending
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <LoadingIndicator />
        <p className="text-sm text-muted">{t('verifyingEmail')}</p>
      </div>
    );
  }

  if (visibleActionStatus === VerifyEmailActionStatus.Success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-accent">{t('emailVerifiedSuccess')}</p>
        <Link
          href={AppRoute.Login}
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  const isTimeoutError =
    actionState.error instanceof VerifyEmailActionTimeoutError;

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-danger">
        {isTimeoutError
          ? t('verifyEmailRequestTimedOutTitle')
          : (getApiErrorMessage(actionState.error) ?? t('verificationFailed'))}
      </p>
      {isTimeoutError ? (
        <p className="text-sm text-muted">
          {t('verifyEmailRequestTimedOutBody')}
        </p>
      ) : null}
      <button
        type="button"
        onClick={retryAction}
        className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/40"
      >
        {t('verifyEmailTryAgain')}
      </button>
      <Link
        href={AppRoute.ResendVerification}
        className="inline-block text-sm font-semibold text-accent hover:underline"
      >
        {t('requestNewLink')}
      </Link>
    </div>
  );
}

export function VerifyEmailContent({
  tokenFromRoute = null,
}: VerifyEmailContentProps) {
  const t = useTranslations('auth');

  return (
    <div>
      <h1 className="text-center font-display text-3xl tracking-tight">
        {t('verifyEmail')}
      </h1>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <LoadingIndicator label={t('loading')} />
            </div>
          }
        >
          <VerifyEmailInner tokenFromRoute={tokenFromRoute} />
        </Suspense>
      </div>
    </div>
  );
}
