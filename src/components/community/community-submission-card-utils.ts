import { GitBranch, Quote, Star, type LucideIcon } from "lucide-react";
import { AppRoute } from "@/constants/app-routes";
import { parseUtcDate } from "@/lib/dayjs";
import type {
  CommunityEditableReview,
  CommunityModerationStatus,
  CommunitySubmission,
} from "@/types/community";
import { outcomeSignalOptions } from "./community-constants";

export const submissionTypeMeta: Record<
  CommunitySubmission["type"],
  { Icon: LucideIcon; avatarClass: string }
> = {
  review: { Icon: Star, avatarClass: "bg-accent-soft text-accent-strong" },
  routine: { Icon: GitBranch, avatarClass: "bg-ai-bg text-ai-strong" },
  result: { Icon: Quote, avatarClass: "bg-surface-muted text-muted" },
};

type StatusVisual = {
  dotClass: string;
  pillClass: string;
  cardBorderAccent?: string;
};

export const submissionStatusVisual: Record<
  CommunitySubmission["status"],
  StatusVisual
> = {
  published: {
    dotClass: "bg-accent",
    pillClass: "border-accent/30 text-accent-strong bg-accent-soft",
  },
  pending_review: {
    dotClass: "bg-ai-strong",
    pillClass: "border-ai-strong/30 text-ai-strong bg-ai-bg",
  },
  needs_edit: {
    dotClass: "bg-warning",
    pillClass: "border-warning/40 text-foreground bg-warning-soft",
    cardBorderAccent: "border-l-4 border-l-warning",
  },
  rejected: {
    dotClass: "bg-danger",
    pillClass: "border-danger/40 text-danger bg-danger-soft",
    cardBorderAccent: "border-l-4 border-l-danger",
  },
  hidden: {
    dotClass: "bg-muted",
    pillClass: "border-border text-muted bg-surface-muted",
  },
  draft: {
    dotClass: "bg-muted",
    pillClass: "border-border text-muted bg-surface",
  },
};

const OUTCOME_SIGNAL_VALUES: ReadonlySet<string> = new Set(
  outcomeSignalOptions.map((option) => option.value),
);

export type ParentNotice = {
  bodyKey: string;
  status: CommunityModerationStatus;
  titleKey: string;
} | null;

export function buildSubmissionCardState(
  item: CommunitySubmission,
  labels: {
    defaultType: string;
    locale: string;
    resultUnknownProduct: string;
    typeFallback: string;
    typePlaybook: string;
    typeReview: string;
  },
) {
  const isResult = item.type === "result";
  const submittedDate = parseUtcDate(item.createdAt);
  return {
    canEdit:
      !isResult &&
      ["draft", "pending_review", "needs_edit", "rejected"].includes(
        item.status,
      ),
    canResubmit:
      !isResult && (item.status === "needs_edit" || item.status === "rejected"),
    displayTitle: getSubmissionDisplayTitle(
      item,
      labels.resultUnknownProduct,
    ),
    showWithdraw:
      isResult ? item.status !== "hidden" : item.status === "published",
    statusVisual: submissionStatusVisual[item.status],
    submittedAbsolute: submittedDate
      ? submittedDate.locale(labels.locale).format("LL")
      : undefined,
    submittedRelative: submittedDate
      ? submittedDate.locale(labels.locale).fromNow()
      : null,
    typeLabel: getSubmissionTypeLabel(item, labels),
    typeMeta: submissionTypeMeta[item.type],
  };
}

export function getModerationGuidance(
  item: CommunitySubmission,
  safetyFlag: CommunitySubmission["safetyFlags"][number] | null,
  labels: {
    fallbackReason: string;
    guidanceInstruction: string;
    resultGuidanceInstruction: string;
  },
) {
  const needsUserEdits =
    item.status === "needs_edit" || item.status === "rejected";
  const reason =
    item.moderationGuidance?.reason ??
    (needsUserEdits ? (safetyFlag?.message ?? labels.fallbackReason) : null);

  return {
    instruction:
      item.type === "result"
        ? labels.resultGuidanceInstruction
        : labels.guidanceInstruction,
    reason,
    source: item.moderationGuidance?.source ?? "system",
  };
}

export function getParentNotice(item: CommunitySubmission): ParentNotice {
  if (item.type !== "result" || !item.parentContent) return null;
  const status = item.parentContent.status;
  if (!status || status === "published") return null;

  const content = item.parentContent.type === "routine" ? "Playbook" : "Review";
  if (status === "needs_edit") {
    return parentNotice("parentNeedsEdit", content, status);
  }
  if (status === "rejected") {
    return parentNotice("parentRejected", content, status);
  }
  if (status === "hidden") {
    return parentNotice("parentHidden", content, status);
  }
  return parentNotice("parent", `${content}UnderModeration`, status);
}

export function getSubmissionViewTarget(
  item: CommunitySubmission,
): { href: string; type: "review" | "routine" } | null {
  if (item.type === "result") {
    return item.parentContent?.status === "published"
      ? {
          href: buildCommunityContentHref(
            item.parentContent.type,
            item.parentContent.id,
          ),
          type: item.parentContent.type,
        }
      : null;
  }

  if (item.status !== "published") return null;
  return {
    href: buildCommunityContentHref(item.type, item.id),
    type: item.type,
  };
}

function parentNotice(
  prefix: string,
  content: string,
  status: CommunityModerationStatus,
): ParentNotice {
  return {
    bodyKey: `${prefix}${content}Body`,
    status,
    titleKey: `${prefix}${content}Title`,
  };
}

function getSubmissionTypeLabel(
  item: CommunitySubmission,
  labels: {
    defaultType: string;
    typeFallback: string;
    typePlaybook: string;
    typeReview: string;
  },
): string {
  if (item.type !== "result") return labels.defaultType;
  if (item.parentContent?.type === "review") return labels.typeReview;
  if (item.parentContent?.type === "routine") return labels.typePlaybook;
  return labels.typeFallback;
}

function buildCommunityContentHref(
  type: "review" | "routine",
  id: string,
): string {
  return `${AppRoute.Community}?tab=${
    type === "review" ? "reviews" : "routines"
  }#community-${type}-${id}`;
}

function getSubmissionDisplayTitle(
  item: CommunitySubmission,
  unknownProductLabel: string,
): string {
  if (item.type === "review") {
    return getReviewProductTitle(item.editableReview, item.title);
  }

  if (item.type === "result") {
    const fallbackTitle = item.title.trim();
    return (
      item.parentContent?.title.trim() ||
      (OUTCOME_SIGNAL_VALUES.has(fallbackTitle) ? "" : fallbackTitle) ||
      unknownProductLabel
    );
  }

  return item.title;
}

function getReviewProductTitle(
  review: CommunityEditableReview | null | undefined,
  fallbackTitle: string,
): string {
  const brand = review?.productBrand.trim() ?? "";
  const name = review?.productName.trim() ?? "";

  if (brand && name) {
    return name.toLowerCase().startsWith(brand.toLowerCase())
      ? name
      : `${brand} ${name}`;
  }

  return name || brand || fallbackTitle;
}
