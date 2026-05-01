import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { AnalysisCard } from "../analysis-card";
import type {
  AnalysisObservations,
  PhotoAnalysisInterpretation,
} from "@/types/skin-journal";

function observations(
  overrides: Partial<AnalysisObservations> = {},
): AnalysisObservations {
  return {
    schema_version: "1.1",
    model_version: "test-model",
    image_quality: {
      face_detected: true,
      lighting_quality: "good",
      framing_quality: "good",
      blur_detected: false,
      issues: [],
      needs_retake: false,
      quality_score: 0.9,
      excluded_from_trends_reason: null,
    },
    detected_concerns: [],
    reaction_signals: {
      reaction_detected: false,
      reaction_severity: "none",
      indicators: [],
      confidence: 0.1,
    },
    barrier_signs: { barrier_compromise: false, indicators: [] },
    overall_assessment: "Skin appears stable today.",
    overall_change_from_previous: "stable",
    user_visible_message: "Skin appears stable today.",
    safety_flags: {
      urgent_review_recommended: false,
      doctor_follow_up_recommended: false,
      reasons: [],
    },
    should_flag_for_doctor: false,
    ...overrides,
  };
}

describe("AnalysisCard", () => {
  const interpretation: PhotoAnalysisInterpretation = {
    version: "1.0",
    code: "barrier_support",
    severity: "warning",
    summary_key: "journal.analysis.interpretation.barrierSupport.summary",
    summary_values: {},
    guidance_keys: ["journal.analysis.interpretation.barrierSupport.guidance"],
    caveat_keys: ["journal.analysis.interpretation.caveats.notDiagnosis"],
    source_ids: ["aad_dry_skin_relief"],
    sources: [
      {
        id: "aad_dry_skin_relief",
        title_key: "journal.analysis.sources.aad_dry_skin_relief.title",
        summary_key: "journal.analysis.sources.aad_dry_skin_relief.summary",
        organization: "American Academy of Dermatology",
        url: "https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin",
        evidence_grade: "moderate",
        last_verified: "2026-05-01",
      },
    ],
    generated_at: "2026-05-01T08:00:00.000Z",
  };

  it("renders source-backed app interpretation before raw AI wording", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations({
          user_visible_message: "RAW AI COPY SHOULD NOT BE PRIMARY",
          overall_assessment: "RAW AI ASSESSMENT",
        })}
        interpretation={interpretation}
      />,
    );

    expect(
      screen.getByText(/your skin barrier may need a calmer routine/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/RAW AI COPY SHOULD NOT BE PRIMARY/i),
    ).not.toBeInTheDocument();
    const source = screen.getByRole("link", {
      name: /american academy of dermatology/i,
    });
    expect(source).toHaveAttribute("target", "_blank");
    expect(source).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("falls back to controlled app wording when interpretation is absent", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations({
          user_visible_message: "RAW AI COPY SHOULD NOT BE SHOWN",
          overall_assessment: "RAW AI ASSESSMENT SHOULD NOT BE SHOWN",
        })}
      />,
    );

    expect(
      screen.getByText(/useful baseline for future comparison/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/RAW AI COPY SHOULD NOT BE SHOWN/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/RAW AI ASSESSMENT SHOULD NOT BE SHOWN/i),
    ).not.toBeInTheDocument();
  });

  it("shows controlled retake guidance when photo quality is not reliable", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations({
          image_quality: {
            face_detected: true,
            lighting_quality: "poor",
            framing_quality: "fair",
            blur_detected: false,
            issues: ["too_dark"],
            needs_retake: true,
            quality_score: 0.28,
            excluded_from_trends_reason: "poor_lighting",
          },
        })}
      />,
    );

    expect(screen.getByText(/photo quality was too low/i)).toBeInTheDocument();
    expect(
      screen.getByText(/upload another photo today if possible/i),
    ).toBeInTheDocument();
  });

  it("shows safety escalation from app copy instead of raw model text", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations({
          safety_flags: {
            urgent_review_recommended: true,
            doctor_follow_up_recommended: true,
            reasons: ["possible_swelling", "hive_like_appearance"],
          },
          doctor_flag_reason:
            "RAW MODEL SHOULD NOT BE DISPLAYED: possible swelling",
          should_flag_for_doctor: true,
        })}
      />,
    );

    expect(screen.getByText(/consider professional review/i)).toBeInTheDocument();
    expect(screen.getByText(/possible swelling/i)).toBeInTheDocument();
    expect(screen.getByText(/hive-like appearance/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/RAW MODEL SHOULD NOT BE DISPLAYED/i),
    ).not.toBeInTheDocument();
  });
});
