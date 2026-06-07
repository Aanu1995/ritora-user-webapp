import { Skeleton } from "@/components/ui/skeleton";

/* ===========================================================
 * Community skeletons
 *
 * Each skeleton mirrors the layout of the real component it
 * replaces during loading. The goal is "no layout jank" — the
 * spaces and shapes the user sees while waiting should be the
 * same spaces the loaded content fills, so the page doesn't
 * shift around when data arrives.
 *
 * Per-card width variation (`subtleVariableWidth(index, ...)`)
 * keeps a list of skeletons from looking like a grid of
 * identical pixels — small, plausible width differences read
 * as "real content of different lengths is loading" rather
 * than a placeholder pattern.
 * ========================================================= */

/* Cycle through a few plausible widths so multiple stacked
   skeleton cards don't look pixel-identical. Width matters
   visually here — height jitter would shift layout, so we
   only vary horizontal sizes. */
function subtleVariableWidth(
  index: number,
  options: readonly string[],
): string {
  return options[index % options.length] ?? options[0] ?? "w-2/3";
}

export function CommunitySkeleton() {
  return (
    <div
      aria-busy
      className="mx-auto max-w-6xl pb-10 motion-safe:animate-in motion-safe:fade-in"
    >
      {/* Page header: title + subtitle + primary action */}
      <div className="flex items-start justify-between gap-3 pt-3 sm:pt-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-md sm:h-7 sm:w-40" />
          <Skeleton className="h-3.5 w-64 rounded-md sm:h-4 sm:w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>

      <div className="mx-auto mt-2 w-full max-w-[54rem]">
        {/* Facet strip placeholder */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Tab strip placeholder */}
        <div className="mt-3 flex gap-1 overflow-hidden rounded-xl border border-border bg-surface-muted/60 p-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-lg" />
          ))}
        </div>

        <div className="mt-4 space-y-8">
          {/* Section: short list of preview items */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-56 rounded-md" />
            </div>
            <CommunityListSkeleton count={2} />
          </section>

          {/* Section: full feed */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
            <CommunityListSkeleton count={3} />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
 * CommunityCardSkeleton
 *
 * Mirrors the structure of RoutineCard / ReviewCard:
 *   - Type avatar (32px circle) at the start.
 *   - Title row: title bar + match/disclosure pill placeholders.
 *   - Action cluster (date badge + CTA) on the right at sm+.
 *   - Summary bar.
 *   - Chip row (relevance + safety).
 *   - Goal evidence block (single row of 3 small tone-pills).
 *   - Steps strip (label + 3-4 chips).
 *   - Outcome signals strip (count line + 5 pill placeholders).
 *
 * Variant placement and width pattern picks up small
 * cycle-based variation per card index so a list of 3
 * skeletons reads as 3 different cards loading, not 3 clones.
 * ========================================================= */
export function CommunityCardSkeleton({ index = 0 }: { index?: number }) {
  const titleWidth = subtleVariableWidth(index, [
    "w-3/4",
    "w-2/3",
    "w-4/5",
    "w-1/2",
  ]);
  const summaryWidth = subtleVariableWidth(index, [
    "w-full",
    "w-5/6",
    "w-11/12",
  ]);
  return (
    <div
      aria-hidden
      className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4"
    >
      {/* Header: avatar + title block + actions cluster */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className={`h-4 ${titleWidth} rounded-md`} />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className={`h-3 ${summaryWidth} rounded-md`} />
            {/* Relevance + safety chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        {/* Actions cluster (date badge + CTA) */}
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Goal evidence row — three tone-pill placeholders */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Steps strip — label + 3-4 numbered chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-28 rounded-md" />
      </div>

      {/* Outcome signals — count line + pill row */}
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, pillIndex) => (
            <Skeleton key={pillIndex} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
 * CommunityListSkeleton — stack of card skeletons used by
 * every feed (Reviews, Playbooks, Mine, Bookmarks). Threads
 * each card's index through so the per-card variable widths
 * don't all line up identically.
 * ========================================================= */
export function CommunityListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-busy
      className="grid grid-cols-1 gap-3 motion-safe:animate-in motion-safe:fade-in"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CommunityCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

/* ===========================================================
 * CommunityDetailSkeleton
 *
 * Mirrors the redesigned playbook detail surface:
 *   1. Page-header strip (only on full-page variant — the
 *      sheet variant uses the SheetTitle in its own header).
 *   2. Hero block: summary lines + meta strip + "Why this
 *      matches you" label + relevance chips + goal evidence
 *      mini-rows + outcome signals strip.
 *   3. Steps section: section title + count badge + unified
 *      list with row dividers (4 step placeholders).
 *   4. Adapt section: title + body + CTA strip.
 * ========================================================= */
export function CommunityDetailSkeleton() {
  return (
    <div
      aria-busy
      className="mx-auto max-w-4xl space-y-5 pb-10 motion-safe:animate-in motion-safe:fade-in"
    >
      {/* Page header (page variant only) */}
      <div className="flex items-start justify-between gap-3 pt-3 sm:pt-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-72 rounded-md sm:h-7 sm:w-96" />
          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Hero block — clean surface, no gradient (matches the
          redesigned hero in CommunityRoutineDetailSurface). */}
      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        {/* Summary lines */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        {/* Meta strip: match + disclosure + safety status */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        {/* "Why this matches you" label + chips */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32 rounded" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
        {/* Goal evidence rows (avoid/habit/warning placeholders) */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-wrap items-center gap-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
        {/* Outcome signals strip */}
        <div className="space-y-2 border-t border-border pt-4">
          <Skeleton className="h-4 w-40 rounded-md" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Steps section — header + unified bordered list with
          row dividers (matches the redesigned step layout). */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={
                index < 3
                  ? "flex items-center gap-3 border-b border-border px-4 py-3"
                  : "flex items-center gap-3 px-4 py-3"
              }
            >
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton
                className={`h-4 ${subtleVariableWidth(index, ["w-2/5", "w-3/5", "w-1/2", "w-2/3"])} rounded-md`}
              />
              <div className="ml-auto flex shrink-0 gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adapt section — title + body + CTA (matches the
          redesigned adapt strip). */}
      <section className="rounded-2xl border border-ai-border bg-ai-bg/30 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-72 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

/* ===========================================================
 * CommunityAdaptResultSkeleton
 *
 * Renders inside the Adapt section while the adaptation
 * mutation is in flight. Matches the redesigned result
 * layout:
 *   - Compact summary stat tiles (4-up grid).
 *   - Unified change list with row dividers (3 change rows).
 *   - Save action footer (hint + button).
 * ========================================================= */
export function CommunityAdaptResultSkeleton() {
  return (
    <div
      aria-busy
      className="mt-5 space-y-4 motion-safe:animate-in motion-safe:fade-in"
    >
      {/* Compact stat tiles */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-surface px-3 py-2.5"
          >
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="mt-1.5 h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Unified change list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={
              index < 2
                ? "border-b border-border px-4 py-3"
                : "px-4 py-3"
            }
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="ml-auto h-5 w-16 rounded-full" />
            </div>
            <Skeleton
              className={`ml-10 mt-1.5 h-4 ${subtleVariableWidth(index, ["w-3/4", "w-2/3", "w-1/2"])} rounded-md`}
            />
            <Skeleton className="ml-10 mt-1 h-3 w-5/6 rounded-md" />
          </div>
        ))}
      </div>

      {/* Save action footer */}
      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-3 w-72 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
    </div>
  );
}
