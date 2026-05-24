import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CommunityPostingEligibility } from "@/types/community";

export function CommunityEditabilityNotice({
  kind,
}: {
  kind: "review" | "playbook";
}) {
  const t = useTranslations("community.editability");
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm leading-5 text-warning"
    >
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 text-foreground">
        <p className="text-sm font-semibold text-warning">{t("heading")}</p>
        <p className="mt-1 leading-5">
          {kind === "review" ? t("reviewBody") : t("playbookBody")}
        </p>
      </div>
    </div>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  const t = useTranslations("community.shared");
  return (
    <span
      role="status"
      aria-label={t("loading")}
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function formatEligibilityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEligibilityReasonTitle(
  code: CommunityPostingEligibility["reasons"][number]["code"],
) {
  switch (code) {
    case "email_unverified":
      return "Email verification required";
    case "skin_profile_required":
      return "Skin profile required";
    case "shelf_product_required":
      return "Shelf product required";
    case "community_guidelines_required":
      return "Community rules required";
    case "account_too_new":
      return "Account age requirement";
    case "recent_moderation_abuse":
      return "Posting temporarily paused";
    default:
      return "Posting requirement";
  }
}
