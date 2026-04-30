import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE_ROOTS = [
  "src/app/(app)/journal",
  "src/components/skin-journal",
  "src/constants/api-paths.ts",
  "src/constants/query-keys.ts",
  "src/hooks/use-skin-journal.ts",
  "src/services/skin-journal.service.ts",
  "src/stores/journal-ui-store.ts",
  "src/types/skin-journal.ts",
];

const FORM_FILES = [
  "src/components/skin-journal/daily-check-in-form.tsx",
  "src/components/skin-journal/dermatologist-export-modal.tsx",
];

const FORBIDDEN_VISIBLE_COPY = [
  "Back to Skin Journal",
  "Not a medical diagnosis.",
  "Visible changes may have many causes.",
  "AI delta",
  "Wrapped not found.",
  "No frames available.",
  "Analysis complete",
  "Analysing…",
  "Analysis failed",
  "Restore my routine",
  "CeraVe",
  "Vitamin C",
  "Glycolic Acid",
  "Retinol",
  "stub model",
  "Recommend simplifying",
];

const REMOVED_REEL_NAMING_PATTERN =
  /(^|[^A-Za-z])(reel|reels|Reel|Reels)([^A-Za-z]|$)/;

function walkSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  if (statSync(directory).isFile()) {
    return /\.(ts|tsx)$/.test(directory) ? [directory] : [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return entry === "__tests__" ? [] : walkSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

function readSource(file: string): string {
  return readFileSync(file, "utf8");
}

describe("Skin Journal frontend quality guardrails", () => {
  const files = SOURCE_ROOTS.flatMap(walkSourceFiles);

  it("keeps Skin Journal source modules under the component size limit", () => {
    const oversized = files
      .map((file) => ({
        file: relative(process.cwd(), file),
        lines: readSource(file).split("\n").length,
      }))
      .filter(({ lines }) => lines > 400);

    expect(oversized).toEqual([]);
  });

  it("does not use mutateAsync or namespace imports in Skin Journal source", () => {
    const violations = files.flatMap((file) => {
      const source = readSource(file);
      const fileLabel = relative(process.cwd(), file);
      const found = [
        source.includes("mutateAsync") ? "mutateAsync" : null,
        /import\s+\*\s+as\s+/.test(source) ? "namespace import" : null,
      ].filter((value): value is string => value !== null);

      return found.map((kind) => `${fileLabel}: ${kind}`);
    });

    expect(violations).toEqual([]);
  });

  it("keeps visible Skin Journal copy in i18n messages instead of component source", () => {
    const violations = files.flatMap((file) => {
      const source = readSource(file);
      const fileLabel = relative(process.cwd(), file);

      return FORBIDDEN_VISIBLE_COPY.filter((phrase) =>
        source.includes(phrase),
      ).map((phrase) => `${fileLabel}: ${phrase}`);
    });

    expect(violations).toEqual([]);
  });

  it("uses Wrapped naming instead of removed reel naming in Skin Journal source", () => {
    const violations = files
      .map((file) => {
        const source = readSource(file);
        const match = source.match(REMOVED_REEL_NAMING_PATTERN);

        return match ? `${relative(process.cwd(), file)}: ${match[0].trim()}` : null;
      })
      .filter((value): value is string => value !== null);

    expect(violations).toEqual([]);
  });

  it("keeps today's photo upload locked to today's entry", () => {
    const uploadPage = readSource(
      join(process.cwd(), "src/app/(app)/journal/upload/page.tsx"),
    );
    const service = readSource(
      join(process.cwd(), "src/services/skin-journal.service.ts"),
    );
    const hooks = readSource(
      join(process.cwd(), "src/hooks/use-skin-journal.ts"),
    );

    expect(uploadPage).not.toContain("useUpsertForDate");
    expect(uploadPage).toContain("useUpsertToday");
    expect(uploadPage).not.toContain("?date=");
    expect(uploadPage).not.toContain('searchParams.get("date")');
    expect(uploadPage).toContain('searchParams.get("mode")');
    expect(uploadPage).not.toContain("Boolean(entry)");
    expect(service).not.toContain("upsertForDate");
    expect(service).not.toContain("postMultipartRequest(\n    ApiPath.SkinJournalDay");
    expect(hooks).not.toContain("useUpsertForDate");
  });

  it("does not route selected calendar days into the today-only upload flow", () => {
    const dayPage = readSource(
      join(process.cwd(), "src/app/(app)/journal/days/[date]/page.tsx"),
    );
    const journalPage = readSource(
      join(process.cwd(), "src/app/(app)/journal/page.tsx"),
    );

    expect(dayPage).not.toContain("/journal/upload?date=");
    expect(dayPage).toContain("buildJournalUploadHref()");
    expect(dayPage).toContain("JournalUploadMode.Edit");
    expect(journalPage).not.toContain("editTodayPhoto");
    expect(journalPage).toContain("router.push(buildJournalUploadHref())");
  });

  it("guards AI-generated compare concern labels before translation lookup", () => {
    const comparePage = readSource(
      join(process.cwd(), "src/app/(app)/journal/compare/page.tsx"),
    );

    expect(comparePage).toContain("safeDynamicTranslation");
    expect(comparePage).not.toContain("tConcerns(c.concern)");
  });

  it("uses TanStack Form with Zod validators for Skin Journal forms", () => {
    const violations = FORM_FILES.flatMap((file) => {
      const source = readSource(join(process.cwd(), file));
      const validationSource = source.includes("daily-check-in-validation")
        ? readSource(
            join(
              process.cwd(),
              "src/components/skin-journal/daily-check-in-validation.ts",
            ),
          )
        : "";
      const sourceWithValidators = `${source}\n${validationSource}`;
      const missing = [
        source.includes("@tanstack/react-form") ? null : "TanStack Form",
        sourceWithValidators.includes("zod") ? null : "Zod",
        source.includes("validators:") ? null : "form validators",
      ].filter((value): value is string => value !== null);

      return missing.map((kind) => `${file}: missing ${kind}`);
    });

    expect(violations).toEqual([]);
  });
});
