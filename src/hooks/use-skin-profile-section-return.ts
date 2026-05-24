"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppRoute } from "@/constants/app-routes";
import type { UnsavedChangesGuardRelease } from "@/hooks/use-unsaved-changes-guard";
import {
  navigateAfterSkinProfileSectionSave,
  readSkinProfileSectionReturnTo,
} from "@/lib/skin-profile-section-return-navigation";

export function useSkinProfileSectionReturn() {
  const router = useRouter();
  const pathname = usePathname() ?? AppRoute.SkinProfile;
  const searchParams = useSearchParams();
  const returnToHref = readSkinProfileSectionReturnTo(searchParams, pathname);
  const backHref = returnToHref ?? AppRoute.SkinProfile;

  return {
    backHref,
    returnAfterSave: (release: UnsavedChangesGuardRelease) => {
      navigateAfterSkinProfileSectionSave({
        router,
        release,
        returnToHref,
      });
    },
  };
}
