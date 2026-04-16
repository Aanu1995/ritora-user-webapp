import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  const navLinks = siteConfig.nav.map((item) => ({
    href: item.href,
    label: t(item.labelKey),
  }));

  return (
    <>
      <SiteHeaderClient
        navLinks={navLinks}
        loginLabel={t("login")}
        signUpLabel={t("signUp")}
        openMenuLabel={t("openMenu")}
        closeMenuLabel={t("closeMenu")}
      />
      <div aria-hidden="true" className="h-18" />
    </>
  );
}
