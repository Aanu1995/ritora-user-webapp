import { AppRoute } from "@/constants/app-routes";

const JOURNAL_UPLOAD_ROUTE = `${AppRoute.Journal}/upload`;

export enum JournalUploadMode {
  Create = "create",
  Edit = "edit",
}

interface BuildJournalUploadHrefOptions {
  mode?: JournalUploadMode;
  reaction?: boolean;
}

export function buildJournalUploadHref(
  options: BuildJournalUploadHrefOptions = {},
): string {
  const params = new URLSearchParams();
  if (options.mode && options.mode !== JournalUploadMode.Create) {
    params.set("mode", options.mode);
  }
  if (options.reaction) {
    params.set("reaction", "1");
  }

  const query = params.toString();
  return query ? `${JOURNAL_UPLOAD_ROUTE}?${query}` : JOURNAL_UPLOAD_ROUTE;
}
