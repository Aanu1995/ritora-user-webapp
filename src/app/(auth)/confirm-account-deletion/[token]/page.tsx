import { AccountDeletionTokenContent } from '@/components/auth/account-deletion-token-content';
import { AccountDeletionTokenMode } from '@/types/auth';

interface ConfirmAccountDeletionTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ConfirmAccountDeletionTokenPage({
  params,
}: ConfirmAccountDeletionTokenPageProps) {
  const { token } = await params;

  return (
    <AccountDeletionTokenContent
      mode={AccountDeletionTokenMode.Confirm}
      tokenFromRoute={decodeURIComponent(token)}
    />
  );
}
