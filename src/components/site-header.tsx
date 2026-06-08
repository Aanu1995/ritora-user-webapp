import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import { SiteHeaderClient } from "./site-header-client";

interface SiteHeaderProps {
  showNavLinks?: boolean;
  navAnchorPrefix?: string;
}

export async function SiteHeader({
  showNavLinks = true,
  navAnchorPrefix = '',
}: SiteHeaderProps = {}) {
  const t = await getTranslations("nav");

  const navLinks = showNavLinks
    ? siteConfig.nav.map((item) => ({
        href:
          navAnchorPrefix && item.href.startsWith('#')
            ? `${navAnchorPrefix}${item.href}`
            : item.href,
        label: t(item.labelKey),
      }))
    : [];

  return (
    <>
      <SiteHeaderClient
        navLinks={navLinks}
        loginLabel={t("login")}
        signUpLabel={t("signUp")}
        openMenuLabel={t("openMenu")}
        closeMenuLabel={t("closeMenu")}
        primaryNavLabel={t("primaryNavigation")}
      />
      <div aria-hidden="true" className="h-18" />
    </>
  );
}
