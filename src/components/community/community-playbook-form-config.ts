import type {
  CommunityRoutine,
  CreateCommunityRoutineInput,
} from "@/types/community";
import { ShelfCategoryFilter, ShelfSort, ShelfStatFilter } from "@/types/shelf";
import type { CommunityRoutineFormValues } from "./community-form-schemas";
import type { SelectOption } from "./community-review-form-utils";

export const communityPlaybookShelfFilters = {
  category: ShelfCategoryFilter.All,
  search: "",
  sort: ShelfSort.Alphabetical,
  stat: ShelfStatFilter.All,
};

export type PlaybookTextFieldName = "title";

export type PlaybookSelectFieldName = "goal" | "goalResult" | "timeframe";

export type PlaybookArrayFieldName =
  | "avoidTags"
  | "didNotWorkTags"
  | "habitTags"
  | "warningTags";

export type PlaybookSelectOptions = readonly SelectOption[];

export type PublishRoutineFormProps = {
  defaultValues?: CommunityRoutineFormValues;
  kind?: "create" | "edit";
  mutationFn?: (
    input: CreateCommunityRoutineInput,
  ) => Promise<CommunityRoutine>;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
  resetOnSuccess?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: (routine: CommunityRoutine) => string;
};
