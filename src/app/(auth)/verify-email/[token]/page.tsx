import { VerifyEmailContent } from '@/components/auth/verify-email-content';

interface VerifyEmailTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function VerifyEmailTokenPage({
  params,
}: VerifyEmailTokenPageProps) {
  const { token } = await params;

  return <VerifyEmailContent tokenFromRoute={decodeURIComponent(token)} />;
}
