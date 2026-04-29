import { AppRoute } from "@/constants/app-routes";

const JOURNAL_UPLOAD_ROUTE = `${AppRoute.Journal}/upload`;

export function buildJournalUploadHref(): string {
  return JOURNAL_UPLOAD_ROUTE;
}
