import type { AnalysisConcern } from "./skin-journal-analysis";

export enum PhotoFilterKind {
  All = "all",
  Reaction = "reaction",
  Concern = "concern",
}

export enum PhotoFilterStaticId {
  All = "all",
  Reaction = "reaction",
}

export type PhotoFilterId =
  | PhotoFilterStaticId
  | `${PhotoFilterKind.Concern}:${AnalysisConcern}`;
