import { AppRoute } from "@/constants/app-routes";

const JOURNAL_UPLOAD_ROUTE = `${AppRoute.Journal}/upload`;

export enum JournalUploadMode {
  Create = "create",
  Edit = "edit",
}

interface BuildJournalUploadHrefOptions {
  mode?: JournalUploadMode;
}

export function buildJournalUploadHref(
  options: BuildJournalUploadHrefOptions = {},
): string {
  if (!options.mode || options.mode === JournalUploadMode.Create) {
    return JOURNAL_UPLOAD_ROUTE;
  }

  return `${JOURNAL_UPLOAD_ROUTE}?mode=${options.mode}`;
}
