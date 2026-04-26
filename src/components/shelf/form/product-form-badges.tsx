export function createSourceBadge(identitySourceLabel?: string) {
  return identitySourceLabel ? (
    <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-soft-foreground">
      {identitySourceLabel}
    </span>
  ) : null;
}

export function createReviewBadge(
  shouldReview: boolean | undefined,
  label: string,
) {
  return shouldReview ? (
    <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
      {label}
    </span>
  ) : null;
}
