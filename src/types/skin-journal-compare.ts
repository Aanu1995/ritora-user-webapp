import type {
  AnalysisConcern,
  PhotoReferenceQualityReason,
} from "./skin-journal-analysis";
import type { ConcernKey, JournalEntry } from "./skin-journal";

export interface CompareResponse {
  from: JournalEntry | null;
  to: JournalEntry | null;
  delta: {
    bullets: Array<{
      code:
        | "rating_improved"
        | "rating_worsened"
        | "reaction_cleared"
        | "reaction_signal_increased"
        | "reaction_signal_reduced"
        | "barrier_signal_worsened"
        | "barrier_signal_improved"
        | "photo_concern_improved"
        | "photo_concern_worsened"
        | "photo_concern_new"
        | "photo_concern_cleared"
        | "not_comparable"
        | "no_major_change";
      tone: "good" | "warn" | "neutral";
      concern?: ConcernKey;
      from_rating?: number;
      to_rating?: number;
      analysis_concern?: AnalysisConcern;
      from_severity?: "none" | "mild" | "moderate" | "severe";
      to_severity?: "none" | "mild" | "moderate" | "severe";
      reason?: PhotoReferenceQualityReason;
      confidence?: number | null;
    }>;
  };
}
