"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck, BookmarkX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import {
  bookmarkCommunityReview,
  bookmarkCommunityRoutine,
  unbookmarkCommunityReview,
  unbookmarkCommunityRoutine,
} from "@/services/community.service";
import type { CommunityBookmarkItem } from "@/types/community";
import { InlineSpinner } from "./community-shared";

type CommunityBookmarkButtonMode = "save" | "remove";
type CommunityBookmarkMutationInput = {
  shouldBookmark: boolean;
};
type CommunityBookmarkMutationResult = {
  bookmarked: boolean;
  contentId: string;
  contentType: CommunityBookmarkItem["type"];
};

export function CommunityBookmarkButton({
  bookmarked = false,
  contentId,
  contentType,
  mode,
}: {
  bookmarked?: boolean;
  contentId: string;
  contentType: CommunityBookmarkItem["type"];
  mode: CommunityBookmarkButtonMode;
}) {
  const t = useTranslations("community.bookmarks");
  const queryClient = useQueryClient();
  const mutation = useMutation<
    CommunityBookmarkMutationResult,
    Error,
    CommunityBookmarkMutationInput
  >({
    mutationFn: async ({ shouldBookmark }) => {
      const result =
        contentType === "routine"
          ? shouldBookmark
            ? await bookmarkCommunityRoutine(contentId)
            : await unbookmarkCommunityRoutine(contentId)
          : shouldBookmark
            ? await bookmarkCommunityReview(contentId)
            : await unbookmarkCommunityReview(contentId);

      return {
        ...result,
        contentId,
        contentType,
      };
    },
    onError: () => {
      toast.error(t("failedToast"));
    },
    onSuccess: (result) => {
      invalidateCommunityBookmarkViews(queryClient);
      toast.success(result.bookmarked ? t("savedToast") : t("removedToast"));
    },
  });

  const latestMutationResult =
    mutation.data?.contentId === contentId &&
    mutation.data.contentType === contentType
      ? mutation.data.bookmarked
      : null;
  const isBookmarked =
    mode === "save" ? (latestMutationResult ?? bookmarked) : false;
  const isRemovingBookmark = mode === "remove" || isBookmarked;
  const Icon =
    mode === "remove" ? BookmarkX : isBookmarked ? BookmarkCheck : Bookmark;
  const label =
    mode === "remove"
      ? t("remove")
      : isBookmarked
        ? t("bookmarked")
        : t("save");
  const pendingLabel = isRemovingBookmark ? t("removing") : t("saving");

  return (
    <Button
      type="button"
      size="icon"
      variant={isBookmarked ? "secondary" : "outline"}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ shouldBookmark: !isRemovingBookmark })}
      aria-pressed={mode === "save" ? isBookmarked : undefined}
      aria-label={mutation.isPending ? pendingLabel : label}
      title={mutation.isPending ? pendingLabel : label}
      className={cn(
        "h-8 w-8 px-0 sm:h-8 sm:w-8",
        /* Bookmarked-in-save-mode: accent border so the user
           can see at a glance which items are saved. */
        isBookmarked && "border border-accent/30",
        /* Remove mode → destructive intent communicated AT
           REST, not on hover. The BookmarkX icon renders in
           `text-danger` from the start so users can see
           "this button removes" without having to hover or
           focus first (critical for keyboard / touch users
           who never get a hover state).

           `hover:text-danger` is REQUIRED — the underlying
           Button `outline` variant ships with `hover:text-
           accent-strong` (green), and tailwind-merge keeps
           it unless we explicitly override the hover text
           color. Without this override the icon would flip
           to green on hover, which is exactly the opposite
           signal of what a remove button should give. */
        mode === "remove" &&
          "border-danger/30 text-danger hover:border-danger/50 hover:bg-danger-soft hover:text-danger",
      )}
    >
      {mutation.isPending ? (
        <InlineSpinner />
      ) : (
        <Icon className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}

function invalidateCommunityBookmarkViews(
  queryClient: ReturnType<typeof useQueryClient>,
): void {
  for (const queryKey of [
    QueryKey.CommunityBookmarks,
    QueryKey.CommunityHome,
    QueryKey.CommunityPeopleLikeMe,
    QueryKey.CommunityProductEvidence,
    QueryKey.CommunityReviews,
    QueryKey.CommunityRoutines,
  ]) {
    void queryClient.invalidateQueries({ queryKey: [queryKey] });
  }
}
