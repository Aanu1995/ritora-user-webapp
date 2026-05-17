import { readFileSync } from "fs";
import { join } from "path";

const UNSAFE_INSIGHT_COPY =
  /\b(causes?|caused|diagnose|diagnosis|cure|prescribe|guarantees?|clinically proven)\b/i;

function readMessages(locale: "en" | "sv") {
  return JSON.parse(
    readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8"),
  ) as {
    journal: {
      insightsTab: Record<string, unknown>;
    };
  };
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("Insight clinical copy", () => {
  it.each(["en", "sv"] as const)(
    "keeps %s Insight Analysis copy out of diagnosis and causation language",
    (locale) => {
      const messages = readMessages(locale);
      const insightStrings = collectStrings(messages.journal.insightsTab);

      expect(
        insightStrings.filter((message) => UNSAFE_INSIGHT_COPY.test(message)),
      ).toEqual([]);
    },
  );
});
