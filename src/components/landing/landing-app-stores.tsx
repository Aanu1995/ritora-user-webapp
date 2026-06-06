"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Store = "apple" | "google";

/**
 * App store badges for the landing page. The mobile apps aren't live yet, so
 * each badge opens a "coming soon" dialog instead of linking to a store.
 *
 * Badge artwork follows Apple's and Google's official identity guidelines:
 * the preferred black badges are used unmodified, the App Store badge is
 * placed first, and badges keep their minimum on-screen size and clear space.
 */
export function LandingAppStores() {
  const t = useTranslations("landing.appStores");
  const [activeStore, setActiveStore] = useState<Store | null>(null);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          <span className="h-px w-4 bg-accent" aria-hidden="true" />
          {t("eyebrow")}
        </span>
        <h2 className="font-display mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {t("headline")}
        </h2>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">
          {t("body")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* App Store badge is placed first per Apple's guidelines. */}
          <button
            type="button"
            onClick={() => setActiveStore("apple")}
            aria-label={t("appStoreAlt")}
            className="rounded-[10px] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Image
              src="/brand/app-store-badge.svg"
              alt={t("appStoreAlt")}
              width={135}
              height={40}
              className="h-12 w-auto sm:h-14"
              unoptimized
              priority={false}
            />
          </button>
          <button
            type="button"
            onClick={() => setActiveStore("google")}
            aria-label={t("googlePlayAlt")}
            className="rounded-[10px] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Image
              src="/brand/google-play-badge.svg"
              alt={t("googlePlayAlt")}
              width={180}
              height={53}
              className="h-12 w-auto sm:h-14"
              unoptimized
              priority={false}
            />
          </button>
        </div>
      </div>

      <Dialog
        open={activeStore !== null}
        onOpenChange={(open) => {
          if (!open) setActiveStore(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>
              {activeStore === "google"
                ? t("dialog.googlePlayBody")
                : t("dialog.appStoreBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setActiveStore(null)}>
              {t("dialog.dismiss")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
