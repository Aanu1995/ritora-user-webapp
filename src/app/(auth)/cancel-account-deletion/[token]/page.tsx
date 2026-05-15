import { AccountDeletionTokenContent } from '@/components/auth/account-deletion-token-content';
import { AccountDeletionTokenMode } from '@/types/auth';

interface CancelAccountDeletionTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CancelAccountDeletionTokenPage({
  params,
}: CancelAccountDeletionTokenPageProps) {
  const { token } = await params;

  return (
    <AccountDeletionTokenContent
      mode={AccountDeletionTokenMode.Cancel}
      tokenFromRoute={decodeURIComponent(token)}
    />
  );
}
