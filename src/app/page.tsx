import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeRouteGuard } from "@/components/auth/home-route-guard";
import {
  LandingFaq,
  LandingFeatures,
  LandingFinalCta,
  LandingHero,
  LandingHowItWorks,
  LandingPrivacy,
  LandingProblem,
  LandingTrustStrip,
} from "@/components/landing/landing-sections";
import { LandingAppStores } from "@/components/landing/landing-app-stores";
import { LandingThemeLock } from "@/components/landing/landing-theme-lock";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const tSite = await getTranslations("site");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description: tSite("description"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <HomeRouteGuard>
      <LandingThemeLock />
      <div className="relative min-h-screen overflow-hidden">
        <SiteHeader />
        <main>
          <LandingHero />
          <LandingTrustStrip />
          <LandingProblem />
          <LandingHowItWorks />
          <LandingFeatures />
          <LandingPrivacy />
          <LandingFaq />
          <LandingFinalCta />
          <LandingAppStores />
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </HomeRouteGuard>
  );
}
