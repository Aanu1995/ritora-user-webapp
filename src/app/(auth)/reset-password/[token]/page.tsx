import { ResetPasswordContent } from '@/components/auth/reset-password-content';

interface ResetPasswordTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ResetPasswordTokenPage({
  params,
}: ResetPasswordTokenPageProps) {
  const { token } = await params;

  return <ResetPasswordContent tokenFromRoute={decodeURIComponent(token)} />;
}
