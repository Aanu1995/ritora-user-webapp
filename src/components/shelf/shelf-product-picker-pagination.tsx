import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { cn } from "@/lib/utils";

type ShelfProductPickerPaginationProps = {
  className?: string;
  disabled?: boolean;
  hasNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  loadMoreErrorLabel: string;
  loadMoreLabel: string;
  loadingMoreLabel: string;
  retryLabel: string;
  onLoadMore: () => Promise<unknown> | void;
};

export function ShelfProductPickerPagination({
  className,
  disabled,
  hasNextPage,
  isFetchNextPageError,
  isFetchingNextPage,
  loadMoreErrorLabel,
  loadMoreLabel,
  loadingMoreLabel,
  retryLabel,
  onLoadMore,
}: ShelfProductPickerPaginationProps) {
  if (!hasNextPage && !isFetchNextPageError && !isFetchingNextPage) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {isFetchNextPageError ? (
        <p className="text-center text-xs text-danger" role="alert">
          {loadMoreErrorLabel}
        </p>
      ) : null}

      {hasNextPage || isFetchNextPageError ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || isFetchingNextPage}
          onClick={() => {
            void onLoadMore();
          }}
          className="w-full"
        >
          {isFetchingNextPage ? (
            <LoadingIndicator label={loadingMoreLabel} size="sm" />
          ) : isFetchNextPageError ? (
            retryLabel
          ) : (
            loadMoreLabel
          )}
        </Button>
      ) : (
        <LoadingIndicator label={loadingMoreLabel} size="sm" />
      )}
    </div>
  );
}
