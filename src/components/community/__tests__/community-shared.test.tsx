import { screen } from "@testing-library/react";
import {
  Badge,
  Chip,
  CommunityCardSkeleton,
  CommunityDetailSkeleton,
  CommunityDisclosureSelect,
  CommunityFieldError,
  CommunityListSkeleton,
  CommunitySkeleton,
  CommunityTextareaField,
  DisclosureBadge,
  EmptyState,
  Field,
  FormGrid,
  FormSection,
  InlineSpinner,
  MatchBadge,
  OutcomeChip,
  SafetyChip,
  disclosureLabel,
  formatEligibilityDate,
  formatEligibilityReasonTitle,
} from "@/components/community/community-shared";
import { renderWithProviders } from "@/test/utils";

describe("community shared primitives", () => {
  it("formats disclosure, eligibility, outcome, safety and match helpers", () => {
    expect(disclosureLabel("brand_rep")).toBe("Brand rep");
    expect(formatEligibilityDate("not-a-date")).toBe("not-a-date");
    expect(formatEligibilityDate("2026-05-25T00:00:00.000Z")).toContain("2026");
    expect(formatEligibilityReasonTitle("email_unverified")).toBe(
      "Email verification required",
    );
    expect(formatEligibilityReasonTitle("recent_moderation_abuse")).toBe(
      "Posting temporarily paused",
    );

    renderWithProviders(
      <div>
        <DisclosureBadge value="sponsored" />
        <DisclosureBadge value="ordinary" />
        <MatchBadge score={90} />
        <MatchBadge score={50} />
        <OutcomeChip value="barrier-recovery" />
        <OutcomeChip value="custom_outcome" />
        <SafetyChip severity="high">High risk</SafetyChip>
        <SafetyChip severity="low">Watch</SafetyChip>
        <Badge tone="ai">AI</Badge>
        <Chip>Reason</Chip>
        <InlineSpinner />
      </div>,
    );

    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText("Ordinary user")).toBeInTheDocument();
    expect(screen.getByText("90% match")).toBeInTheDocument();
    expect(screen.getByText("50% match")).toBeInTheDocument();
    expect(screen.getByText("Barrier recovery")).toBeInTheDocument();
    expect(screen.getByText("Custom Outcome")).toBeInTheDocument();
    expect(screen.getByText("High risk")).toBeInTheDocument();
    expect(screen.getByText("Watch")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("renders field, textarea, select, empty state and skeleton primitives", () => {
    const textField = {
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      name: "body",
      state: {
        meta: { errors: [new Error("Body is too long.")] },
        value: "Existing text",
      },
    };
    const disclosureField = {
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      name: "disclosureType",
      state: {
        meta: { errors: ["Disclosure is required."] },
        value: "ordinary" as const,
      },
    };

    renderWithProviders(
      <div>
        <Field label="Standalone" hint="Helpful hint" required>
          <input aria-label="Standalone input" />
        </Field>
        <FormSection title="Section" description="Section copy">
          <FormGrid>
            <CommunityTextareaField
              field={textField}
              label="Review text"
              maxLength={1200}
            />
            <CommunityDisclosureSelect field={disclosureField} />
          </FormGrid>
        </FormSection>
        <CommunityFieldError errors={[{ message: "Object error" }]} />
        <EmptyState title="Nothing yet" body="Community content will appear." />
        <CommunitySkeleton />
        <CommunityCardSkeleton />
        <CommunityListSkeleton count={2} />
        <CommunityDetailSkeleton />
      </div>,
    );

    expect(screen.getByText("Helpful hint")).toBeInTheDocument();
    expect(screen.getByText("Section copy")).toBeInTheDocument();
    expect(screen.getByText("Body is too long.")).toBeInTheDocument();
    expect(screen.getByText("Disclosure is required.")).toBeInTheDocument();
    expect(screen.getByText("Object error")).toBeInTheDocument();
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(screen.getByText("Existing text")).toBeInTheDocument();
  });
});
