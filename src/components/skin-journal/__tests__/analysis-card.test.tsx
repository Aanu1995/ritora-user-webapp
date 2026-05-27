import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { AnalysisCard } from "../analysis-card";
import {
  AnalysisFeedbackReason,
  AnalysisFeedbackVote,
  PhotoAnalysisConcernReadLabel,
  PhotoAnalysisInterpretationVersion,
  PhotoAnalysisReadingLabel,
  PhotoAnalysisSchemaVersion,
  type AnalysisObservations,
  type PhotoAnalysisInterpretation,
} from "@/types/skin-journal";

const FeedbackVote = AnalysisFeedbackVote;
const FeedbackReason = AnalysisFeedbackReason;
const ReadLabel = PhotoAnalysisReadingLabel;
const ConcernReadLabel = PhotoAnalysisConcernReadLabel;
const InterpretationVersion = PhotoAnalysisInterpretationVersion;
const SchemaVersion = PhotoAnalysisSchemaVersion;

function observations(
  overrides: Partial<AnalysisObservations> = {},
): AnalysisObservations {
  return {
    schema_version: SchemaVersion.V1_1,
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
    version: InterpretationVersion.V1_0,
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

  it("renders v1.1 action cards instead of a numeric confidence badge", () => {
    const richInterpretation: PhotoAnalysisInterpretation = {
      ...interpretation,
      version: InterpretationVersion.V1_1,
      reading_quality: {
        visual_label: ReadLabel.Useful,
        trend_label: ReadLabel.Limited,
        reason_keys: [
          { key: "journal.analysis.reading.reasons.multiAngle" },
          { key: "journal.analysis.reading.reasons.noPrior" },
        ],
      },
      concern_guidance: [
        {
          concern: "acne",
          severity: "moderate",
          locations: ["left_cheek", "chin"],
          confidence_label: ConcernReadLabel.LikelyVisible,
          title_key: "journal.analysis.guidance.acne.title",
          summary: {
            key: "journal.analysis.guidance.acne.summary",
            values: { severity: "moderate", locations: "left cheek, chin" },
          },
          possible_factor_keys: [
            { key: "journal.analysis.guidance.factors.acneCommonContributors" },
          ],
          action_keys: [
            { key: "journal.analysis.guidance.actions.acneSteadyRoutine" },
            { key: "journal.analysis.guidance.actions.sameLight" },
          ],
          avoid_keys: [
            { key: "journal.analysis.guidance.avoid.multipleNewActives" },
            { key: "journal.analysis.guidance.avoid.overReadingOnePhoto" },
          ],
          track_key: { key: "journal.analysis.guidance.acne.track" },
          escalation_key: null,
          source_ids: ["aad_acne_skin_care_tips"],
          sources: [
            {
              id: "aad_acne_skin_care_tips",
              title_key: "journal.analysis.sources.aad_acne_skin_care_tips.title",
              summary_key:
                "journal.analysis.sources.aad_acne_skin_care_tips.summary",
              organization: "American Academy of Dermatology",
              url: "https://www.aad.org/public/diseases/acne/skin-care/tips",
              evidence_grade: "moderate",
              last_verified: "2026-05-01",
            },
          ],
        },
      ],
    };

    renderWithProviders(
      <AnalysisCard
        observations={observations({
          detected_concerns: [
            {
              concern: "acne",
              severity: "moderate",
              locations: ["left_cheek", "chin"],
              confidence: 0.82,
            },
          ],
        })}
        interpretation={richInterpretation}
      />,
    );

    expect(screen.getByText(/photo read: useful read/i)).toBeInTheDocument();
    expect(screen.queryByText(/confidence 0/i)).not.toBeInTheDocument();
    expect(screen.getByText(/breakout support/i)).toBeInTheDocument();
    expect(screen.getAllByText(/left cheek, chin/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/possible cause/i)).toBeInTheDocument();
    expect(screen.queryByText(/possible factors/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/context clues/i)).not.toBeInTheDocument();
    expect(screen.getByText(/try next/i)).toBeInTheDocument();
    expect(screen.getAllByText(/acne skin-care tips/i).length).toBeGreaterThan(
      0,
    );
  });

  it("does not repeat the same possible cause across every concern card", () => {
    const richInterpretation: PhotoAnalysisInterpretation = {
      ...interpretation,
      version: InterpretationVersion.V1_1,
      concern_guidance: [
        {
          concern: "acne",
          severity: "mild",
          locations: ["left_cheek"],
          confidence_label: ConcernReadLabel.Possible,
          title_key: "journal.analysis.guidance.acne.title",
          summary: {
            key: "journal.analysis.guidance.acne.summary",
            values: { severity: "mild", locations: "left cheek" },
          },
          possible_factor_keys: [
            {
              key: "journal.analysis.guidance.factors.recentApplicationChange",
            },
            { key: "journal.analysis.guidance.factors.acneCommonContributors" },
          ],
          action_keys: [
            { key: "journal.analysis.guidance.actions.acneSteadyRoutine" },
          ],
          avoid_keys: [
            { key: "journal.analysis.guidance.avoid.multipleNewActives" },
          ],
          track_key: { key: "journal.analysis.guidance.acne.track" },
          escalation_key: null,
          source_ids: [],
          sources: [],
        },
        {
          concern: "hyperpigmentation",
          severity: "mild",
          locations: ["forehead"],
          confidence_label: ConcernReadLabel.Possible,
          title_key: "journal.analysis.guidance.hyperpigmentation.title",
          summary: {
            key: "journal.analysis.guidance.hyperpigmentation.summary",
            values: { severity: "mild", locations: "forehead" },
          },
          possible_factor_keys: [
            {
              key: "journal.analysis.guidance.factors.recentApplicationChange",
            },
            { key: "journal.analysis.guidance.factors.pigmentCommonContributors" },
          ],
          action_keys: [
            { key: "journal.analysis.guidance.actions.spfContext" },
            { key: "journal.analysis.guidance.actions.sameLight" },
          ],
          avoid_keys: [
            { key: "journal.analysis.guidance.avoid.dailyJudgement" },
            { key: "journal.analysis.guidance.avoid.overReadingOnePhoto" },
          ],
          track_key: { key: "journal.analysis.guidance.acne.track" },
          escalation_key: null,
          source_ids: [],
          sources: [],
        },
      ],
    };

    renderWithProviders(
      <AnalysisCard
        observations={observations()}
        interpretation={richInterpretation}
      />,
    );

    expect(
      screen.getAllByText(/A relevant routine step was skipped/i),
    ).toHaveLength(1);
    expect(screen.getAllByText(/Use similar daylight/i)).toHaveLength(1);
    expect(screen.getAllByText(/Over-reading one photo/i)).toHaveLength(1);
    expect(screen.getAllByText(/Watch whether clusters change/i)).toHaveLength(
      1,
    );
    expect(
      screen.getByText(/Common acne contributors include/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Common contributors include sun exposure/i),
    ).toBeInTheDocument();
  });

  it("renders helpfulness buttons and sends the selected signal", () => {
    const onFeedback = jest.fn();

    renderWithProviders(
      <AnalysisCard
        observations={observations()}
        interpretation={interpretation}
        onFeedback={onFeedback}
      />,
    );

    expect(screen.getByText(/was this analysis helpful/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /not helpful/i }));

    expect(screen.getByText(/what made it unhelpful/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /too generic/i }));
    fireEvent.change(screen.getByLabelText(/optional feedback note/i), {
      target: { value: "Needed more specific routine guidance." },
    });
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(onFeedback).toHaveBeenCalledWith({
      note: "Needed more specific routine guidance.",
      reason: FeedbackReason.TooGeneric,
      vote: FeedbackVote.NotHelpful,
    });
  });

  it("hides the feedback prompt once feedback has already been submitted", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations()}
        interpretation={interpretation}
        feedbackVote={FeedbackVote.Helpful}
        onFeedback={jest.fn()}
      />,
    );

    expect(
      screen.queryByText(/was this analysis helpful/i),
    ).not.toBeInTheDocument();
  });

  it("shows a loading indicator while feedback is saving", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations()}
        interpretation={interpretation}
        feedbackDisabled
        onFeedback={jest.fn()}
      />,
    );

    expect(screen.getByText(/saving feedback/i)).toBeInTheDocument();
  });

  it("offers one-click reinterpretation for legacy v1.0 payloads", () => {
    const onReinterpret = jest.fn();

    renderWithProviders(
      <AnalysisCard
        observations={observations()}
        interpretation={interpretation}
        onReinterpret={onReinterpret}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /update analysis/i }),
    );

    expect(onReinterpret).toHaveBeenCalledTimes(1);
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

  it("deduplicates repeated per-angle quality rows from stale analysis payloads", () => {
    renderWithProviders(
      <AnalysisCard
        observations={observations({
          per_angle_quality: [
            {
              angle: "head_on",
              face_detected: true,
              lighting_quality: "good",
              framing_quality: "good",
              blur_detected: false,
              issues: [],
              quality_score: 0.9,
              needs_retake: false,
              used_for_analysis: true,
            },
            {
              angle: "head_on",
              face_detected: true,
              lighting_quality: "good",
              framing_quality: "good",
              blur_detected: false,
              issues: [],
              quality_score: 0.91,
              needs_retake: false,
              used_for_analysis: true,
            },
            {
              angle: "left_profile",
              face_detected: true,
              lighting_quality: "fair",
              framing_quality: "good",
              blur_detected: false,
              issues: [],
              quality_score: 0.75,
              needs_retake: false,
              used_for_analysis: true,
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByText(/front/i)).toHaveLength(1);
    expect(screen.getByText(/left side/i)).toBeInTheDocument();
  });
});
