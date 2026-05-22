import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppRoute } from "@/constants/app-routes";
import { cn } from "@/lib/utils";

interface AuthLegalDisclosureProps {
  className?: string;
}

export function AuthLegalDisclosure({ className }: AuthLegalDisclosureProps) {
  const t = useTranslations("auth");

  return (
    <p className={cn("text-center text-xs leading-5 text-muted", className)}>
      {t("legalDisclosurePrefix")}{" "}
      <Link
        href={AppRoute.Terms}
        className="font-medium text-accent-strong hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("termsOfService")}
      </Link>{" "}
      {t("and")}{" "}
      <Link
        href={AppRoute.Privacy}
        className="font-medium text-accent-strong hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("privacyPolicy")}
      </Link>
      .
    </p>
  );
}
