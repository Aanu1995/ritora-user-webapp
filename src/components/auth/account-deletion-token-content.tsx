'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ErrorView } from '@/components/auth/account-deletion-token-error-view';
import { PendingView } from '@/components/auth/account-deletion-token-primitives';
import {
  CancelSuccessView,
  ConfirmSuccessView,
} from '@/components/auth/account-deletion-token-success-views';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useActionToken } from '@/hooks/use-action-token';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  cancelAccountDeletion,
  confirmAccountDeletion,
} from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { AccountDeletionTokenMode } from '@/types/auth';

interface AccountDeletionTokenContentProps {
  mode: AccountDeletionTokenMode;
  tokenFromRoute?: string | null;
}

export const ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS = 8000;
export const ACCOUNT_DELETION_TOKEN_ACTION_TIMEOUT_MS = 30000;

enum AccountDeletionTokenActionStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

class AccountDeletionTokenActionTimeoutError extends Error {
  constructor() {
    super('Account deletion link request timed out');
    this.name = 'AccountDeletionTokenActionTimeoutError';
  }
}

type AccountDeletionTokenActionState = {
  actionKey: string | null;
  status: AccountDeletionTokenActionStatus;
  error: unknown;
};

const INITIAL_ACTION_STATE: AccountDeletionTokenActionState = {
  actionKey: null,
  status: AccountDeletionTokenActionStatus.Idle,
  error: null,
};

const inFlightAccountDeletionTokenActions = new Map<string, Promise<void>>();

function getAccountDeletionTokenActionCacheKey(
  mode: AccountDeletionTokenMode,
  token: string,
): string {
  return `${mode}:${token}`;
}

function runAccountDeletionTokenAction(
  mode: AccountDeletionTokenMode,
  token: string,
): Promise<void> {
  const cacheKey = getAccountDeletionTokenActionCacheKey(mode, token);
  const inFlightAction = inFlightAccountDeletionTokenActions.get(cacheKey);

  if (inFlightAction) {
    return inFlightAction;
  }

  const operation =
    mode === AccountDeletionTokenMode.Confirm
      ? confirmAccountDeletion(token).then(() => undefined)
      : cancelAccountDeletion(token).then(() => undefined);

  inFlightAccountDeletionTokenActions.set(cacheKey, operation);
  operation.then(
    () => {
      inFlightAccountDeletionTokenActions.delete(cacheKey);
    },
    () => {
      inFlightAccountDeletionTokenActions.delete(cacheKey);
    },
  );

  return operation;
}

function clearInFlightAccountDeletionTokenAction(
  mode: AccountDeletionTokenMode,
  token: string,
): void {
  inFlightAccountDeletionTokenActions.delete(
    getAccountDeletionTokenActionCacheKey(mode, token),
  );
}

function withAccountDeletionTokenActionTimeout<T>(
  operation: Promise<T>,
): Promise<T> {
  let timeout: number | null = null;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = window.setTimeout(() => {
      reject(new AccountDeletionTokenActionTimeoutError());
    }, ACCOUNT_DELETION_TOKEN_ACTION_TIMEOUT_MS);
  });

  return Promise.race([operation, timeoutPromise]).finally(() => {
    if (timeout) {
      window.clearTimeout(timeout);
    }
  });
}

function AccountDeletionTokenInner({
  mode,
  tokenFromRoute = null,
}: AccountDeletionTokenContentProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);
  const actionToken = useActionToken();
  const activeActionRef = useRef(0);
  const [actionState, setActionState] =
    useState<AccountDeletionTokenActionState>(INITIAL_ACTION_STATE);
  const [retryCount, setRetryCount] = useState(0);

  const token = tokenFromRoute?.trim() || actionToken.token;
  const isReady = tokenFromRoute !== null ? true : actionToken.isReady;
  const isConfirm = mode === AccountDeletionTokenMode.Confirm;
  const actionKey = isReady && token ? `${mode}:${token}:${retryCount}` : null;
  const visibleActionStatus =
    actionKey && actionState.actionKey !== actionKey
      ? AccountDeletionTokenActionStatus.Pending
      : actionState.status;

  const headerTitle = isConfirm
    ? t('accountDeletionConfirmTitle')
    : t('accountDeletionCancelTitle');
  const pendingMessage = isConfirm
    ? t('accountDeletionConfirming')
    : t('accountDeletionCancelling');

  useEffect(() => {
    if (!actionKey || !token) {
      return;
    }

    let isCurrentActionMounted = true;
    activeActionRef.current += 1;
    const actionId = activeActionRef.current;

    void withAccountDeletionTokenActionTimeout(
      runAccountDeletionTokenAction(mode, token),
    )
      .then(() => {
        if (!isCurrentActionMounted || activeActionRef.current !== actionId) {
          return;
        }

        setActionState({
          actionKey,
          status: AccountDeletionTokenActionStatus.Success,
          error: null,
        });
        logoutStore();
        queryClient.removeQueries();
      })
      .catch((error: unknown) => {
        if (!isCurrentActionMounted || activeActionRef.current !== actionId) {
          return;
        }

        setActionState({
          actionKey,
          status: AccountDeletionTokenActionStatus.Error,
          error,
        });
      });

    return () => {
      isCurrentActionMounted = false;
    };
  }, [actionKey, logoutStore, mode, queryClient, token]);

  useEffect(() => {
    if (visibleActionStatus !== AccountDeletionTokenActionStatus.Success) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.replace(AppRoute.Login);
    }, ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [router, visibleActionStatus]);

  const retryAction = () => {
    if (token) {
      clearInFlightAccountDeletionTokenAction(mode, token);
    }
    setRetryCount((current) => current + 1);
  };

  if (!isReady) {
    return (
      <div>
        <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {headerTitle}
        </h1>
        <div className="mt-8">
          <PendingView message={t('loading')} />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <h1 className="sr-only">{headerTitle}</h1>
        <ErrorView
          title={t('accountDeletionInvalidToken')}
          body={t('accountDeletionInvalidTokenHelp')}
          t={t}
          showNextSteps
        />
      </div>
    );
  }

  if (
    visibleActionStatus === AccountDeletionTokenActionStatus.Idle ||
    visibleActionStatus === AccountDeletionTokenActionStatus.Pending
  ) {
    return (
      <div>
        <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {headerTitle}
        </h1>
        <div className="mt-8">
          <PendingView message={pendingMessage} />
        </div>
      </div>
    );
  }

  if (visibleActionStatus === AccountDeletionTokenActionStatus.Success) {
    return (
      <div>
        <h1 className="sr-only">{headerTitle}</h1>
        {isConfirm ? (
          <ConfirmSuccessView
            title={t('accountDeletionConfirmSuccessTitle')}
            body={t('accountDeletionConfirmSuccessBody')}
            t={t}
          />
        ) : (
          <CancelSuccessView
            title={t('accountDeletionCancelSuccessTitle')}
            body={t('accountDeletionCancelSuccessBody')}
            t={t}
          />
        )}
      </div>
    );
  }

  const isTimeoutError =
    actionState.error instanceof AccountDeletionTokenActionTimeoutError;
  const errorBody = isTimeoutError
    ? t('accountDeletionRequestTimedOutBody')
    : (getApiErrorMessage(actionState.error) ??
      (isConfirm
        ? t('accountDeletionConfirmFailedBody')
        : t('accountDeletionCancelFailedBody')));
  const errorTitle = isTimeoutError
    ? t('accountDeletionRequestTimedOutTitle')
    : isConfirm
      ? t('accountDeletionConfirmFailedTitle')
      : t('accountDeletionCancelFailedTitle');

  return (
    <div>
      <h1 className="sr-only">{headerTitle}</h1>
      <ErrorView
        title={errorTitle}
        body={errorBody}
        t={t}
        showCommonReasons={!isTimeoutError}
        onRetry={retryAction}
        retryLabel={t('accountDeletionTryAgain')}
      />
    </div>
  );
}

export function AccountDeletionTokenContent({
  mode,
  tokenFromRoute = null,
}: AccountDeletionTokenContentProps) {
  const t = useTranslations('auth');

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-6">
          <LoadingIndicator label={t('loading')} />
        </div>
      }
    >
      <AccountDeletionTokenInner
        mode={mode}
        tokenFromRoute={tokenFromRoute}
      />
    </Suspense>
  );
}
