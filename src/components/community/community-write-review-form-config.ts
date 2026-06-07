import type { CreateCommunityReviewInput } from "@/types/community";
import { ShelfCategoryFilter, ShelfSort, ShelfStatFilter } from "@/types/shelf";
import type { CommunityReviewFormValues } from "./community-form-schemas";
import type { CommunityReviewProductFieldGroupProps } from "./community-review-product-field-group";

export const communityReviewShelfFilters = {
  category: ShelfCategoryFilter.All,
  search: "",
  sort: ShelfSort.Alphabetical,
  stat: ShelfStatFilter.All,
};

export type ProductFieldGroupConfig = Omit<
  CommunityReviewProductFieldGroupProps,
  "fieldRenderer" | "isLoadingProducts" | "products"
>;

export type CommunityReviewMutationResult = { moderationStatus: string };

export type WriteReviewFormProps = {
  defaultValues?: CommunityReviewFormValues;
  kind?: "create" | "edit";
  mutationFn?: (
    input: CreateCommunityReviewInput,
  ) => Promise<CommunityReviewMutationResult>;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
  resetOnSuccess?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: (review: CommunityReviewMutationResult) => string;
};
