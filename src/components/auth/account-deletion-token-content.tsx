'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useRef } from 'react';
import { ErrorView } from '@/components/auth/account-deletion-token-error-view';
import { PendingView } from '@/components/auth/account-deletion-token-primitives';
import {
  CancelSuccessView,
  ConfirmSuccessView,
} from '@/components/auth/account-deletion-token-success-views';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useActionToken } from '@/hooks/use-action-token';
import {
  useCancelAccountDeletion,
  useConfirmAccountDeletion,
} from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { AccountDeletionTokenMode } from '@/types/auth';

interface AccountDeletionTokenContentProps {
  mode: AccountDeletionTokenMode;
  tokenFromRoute?: string | null;
}

export const ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS = 8000;

function AccountDeletionTokenInner({
  mode,
  tokenFromRoute = null,
}: AccountDeletionTokenContentProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const actionToken = useActionToken();
  const confirmDeletion = useConfirmAccountDeletion();
  const cancelDeletion = useCancelAccountDeletion();
  const attemptedActionRef = useRef<string | null>(null);

  const token = tokenFromRoute?.trim() || actionToken.token;
  const isReady = tokenFromRoute !== null ? true : actionToken.isReady;
  const mutation =
    mode === AccountDeletionTokenMode.Confirm ? confirmDeletion : cancelDeletion;
  const actionKey = `${mode}:${token}`;
  const isConfirm = mode === AccountDeletionTokenMode.Confirm;

  const headerTitle = isConfirm
    ? t('accountDeletionConfirmTitle')
    : t('accountDeletionCancelTitle');
  const pendingMessage = isConfirm
    ? t('accountDeletionConfirming')
    : t('accountDeletionCancelling');

  useEffect(() => {
    if (!token || attemptedActionRef.current === actionKey) {
      return;
    }

    attemptedActionRef.current = actionKey;

    if (isConfirm) {
      confirmDeletion.mutate(token);
      return;
    }

    cancelDeletion.mutate(token);
  }, [actionKey, cancelDeletion, confirmDeletion, isConfirm, token]);

  useEffect(() => {
    if (!mutation.isSuccess) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.replace(AppRoute.Login);
    }, ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [mutation.isSuccess, router]);

  if (!isReady) {
    return (
      <div>
        <h1 className="text-center font-display text-3xl tracking-tight">
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

  if (mutation.isPending || (!mutation.isSuccess && !mutation.error)) {
    return (
      <div>
        <h1 className="text-center font-display text-3xl tracking-tight">
          {headerTitle}
        </h1>
        <div className="mt-8">
          <PendingView message={pendingMessage} />
        </div>
      </div>
    );
  }

  if (mutation.isSuccess) {
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

  const errorBody =
    getApiErrorMessage(mutation.error) ??
    (isConfirm
      ? t('accountDeletionConfirmFailedBody')
      : t('accountDeletionCancelFailedBody'));
  const errorTitle = isConfirm
    ? t('accountDeletionConfirmFailedTitle')
    : t('accountDeletionCancelFailedTitle');

  return (
    <div>
      <h1 className="sr-only">{headerTitle}</h1>
      <ErrorView
        title={errorTitle}
        body={errorBody}
        t={t}
        showCommonReasons
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
