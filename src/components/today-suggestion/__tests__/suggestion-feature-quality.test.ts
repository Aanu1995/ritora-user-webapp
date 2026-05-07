import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE_ROOTS = [
  "src/app/(app)/todays-suggestion",
  "src/app/(app)/history",
  "src/components/today-suggestion",
  "src/components/history",
  "src/components/settings/notification-form-controls.tsx",
  "src/components/settings/notification-preferences-form.tsx",
  "src/components/settings/photo-reminder-section.tsx",
  "src/components/settings/quiet-hours-section.tsx",
  "src/components/settings/reaction-alerts-section.tsx",
  "src/components/settings/insights-notification-section.tsx",
  "src/components/settings/todays-suggestion-notification-section.tsx",
  "src/components/settings/notifications-tab.tsx",
  "src/hooks/use-suggestions.ts",
  "src/hooks/use-application-tracking.ts",
  "src/services/suggestions.service.ts",
  "src/services/application-tracking.service.ts",
  "src/types/suggestions.ts",
  "src/types/application-tracking.ts",
  "src/lib/suggestion-daypart.ts",
];

const USE_EFFECT_ALLOWLIST = new Set([
  "src/app/(app)/todays-suggestion/page.tsx",
  "src/components/history/header-popovers.tsx",
]);

function walkSourceFiles(target: string): string[] {
  const fullTarget = join(process.cwd(), target);
  if (!existsSync(fullTarget)) {
    return [];
  }

  if (statSync(fullTarget).isFile()) {
    return /\.(ts|tsx)$/.test(fullTarget) ? [fullTarget] : [];
  }

  return readdirSync(fullTarget).flatMap((entry) => {
    const fullPath = join(fullTarget, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return entry === "__tests__" ? [] : walkSourceFiles(relative(process.cwd(), fullPath));
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

function readSource(file: string): string {
  return readFileSync(file, "utf8");
}

function collectMessageStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value as Record<string, unknown>).flatMap(
    collectMessageStrings,
  );
}

describe("Today's Suggestion frontend quality guardrails", () => {
  const files = SOURCE_ROOTS.flatMap(walkSourceFiles);

  it("keeps feature source modules under the 400-line limit", () => {
    const oversized = files
      .map((file) => ({
        file: relative(process.cwd(), file),
        lines: readSource(file).split("\n").length,
      }))
      .filter(({ lines }) => lines > 400);

    expect(oversized).toEqual([]);
  });

  it("does not use mutateAsync, namespace imports, or explicit any in implementation", () => {
    const violations = files.flatMap((file) => {
      const source = readSource(file);
      const fileLabel = relative(process.cwd(), file);
      const found = [
        source.includes("mutateAsync") ? "mutateAsync" : null,
        /import\s+\*\s+as\s+/.test(source) ? "namespace import" : null,
        /\b(as|:)\s+any\b|<any\b|Array<any>|Record<string,\s*any>/.test(source)
          ? "explicit any"
          : null,
      ].filter((value): value is string => value !== null);

      return found.map((kind) => `${fileLabel}: ${kind}`);
    });

    expect(violations).toEqual([]);
  });

  it("limits useEffect to the two necessary UI integration cases", () => {
    const violations = files
      .map((file) => {
        const source = readSource(file);
        const fileLabel = relative(process.cwd(), file);
        return source.includes("useEffect") && !USE_EFFECT_ALLOWLIST.has(fileLabel)
          ? fileLabel
          : null;
      })
      .filter((value): value is string => value !== null);

    expect(violations).toEqual([]);
  });

  it("uses TanStack Form and Zod for suggestion-related forms", () => {
    const recordSheet = readSource(
      join(process.cwd(), "src/components/today-suggestion/record-application-sheet.tsx"),
    );
    const recordSchema = readSource(
      join(process.cwd(), "src/components/today-suggestion/record-application-form.ts"),
    );
    const onDemandDialog = readSource(
      join(process.cwd(), "src/components/today-suggestion/on-demand-suggestion-dialog.tsx"),
    );
    const onDemandSchema = readSource(
      join(process.cwd(), "src/components/today-suggestion/on-demand-suggestion-validation.ts"),
    );
    const notificationForm = readSource(
      join(process.cwd(), "src/components/settings/notification-preferences-form.tsx"),
    );
    const notificationControls = readSource(
      join(process.cwd(), "src/components/settings/notification-form-controls.tsx"),
    );

    expect(recordSheet).toContain("@tanstack/react-form");
    expect(recordSchema).toContain('from "zod"');
    expect(onDemandDialog).toContain("@tanstack/react-form");
    expect(onDemandSchema).toContain('from "zod"');
    expect(notificationForm).toContain("@tanstack/react-form");
    expect(notificationControls).toContain('from "zod"');
  });

  it("uses skeletons, not spinners, for suggestion and history fetch states", () => {
    const todayPage = readSource(
      join(process.cwd(), "src/app/(app)/todays-suggestion/page.tsx"),
    );
    const historyPage = readSource(
      join(process.cwd(), "src/app/(app)/history/page.tsx"),
    );
    const historyDayPage = readSource(
      join(process.cwd(), "src/app/(app)/history/[date]/page.tsx"),
    );

    expect(todayPage).toContain("TodaysSuggestionSkeleton");
    expect(historyPage).toContain("HistoryListSkeleton");
    expect(historyDayPage).toContain("HistoryDayDetailSkeleton");
    expect(todayPage).not.toContain("LoadingIndicator");
    expect(historyPage).not.toContain("LoadingIndicator");
    expect(historyDayPage).not.toContain("LoadingIndicator");
  });

  it("keeps Today user-facing copy free of internal slot wording", () => {
    const messages = JSON.parse(
      readSource(join(process.cwd(), "messages/en.json")),
    ) as Record<string, unknown>;
    const todayMessages = messages.todaysSuggestion;

    const violations = collectMessageStrings(todayMessages)
      .filter((message) => /\bslots?\b/i.test(message))
      .sort();

    expect(violations).toEqual([]);
  });
});
