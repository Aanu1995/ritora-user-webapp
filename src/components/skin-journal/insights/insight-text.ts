import type { LocalizedInsightText } from "@/types/skin-journal";

const INSIGHTS_PREFIX = "journal.insightsTab.";

type InsightTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function stripInsightsPrefix(key: string): string {
  return key.startsWith(INSIGHTS_PREFIX)
    ? key.slice(INSIGHTS_PREFIX.length)
    : key;
}

function translateConcern(
  tConcerns: InsightTranslator,
  value: string | number | boolean | null,
): string | number {
  if (typeof value !== "string") {
    return typeof value === "number" ? value : String(value ?? "");
  }

  try {
    return tConcerns(value);
  } catch {
    return value;
  }
}

function translateInsightValue(
  tInsights: InsightTranslator,
  tConcerns: InsightTranslator,
  key: string,
  value: string | number | boolean | null,
): string | number {
  if (key === "concern") {
    return translateConcern(tConcerns, value);
  }

  if (typeof value !== "string") {
    return typeof value === "number" ? value : String(value ?? "");
  }

  const namespaceByKey: Record<string, string> = {
    direction: "directions",
    factor: "factors",
    phase: "cycle",
    location: "locations",
  };
  const namespace = namespaceByKey[key];
  if (!namespace) {
    return value;
  }

  try {
    return tInsights(`${namespace}.${value}`);
  } catch {
    return value;
  }
}

export function resolveInsightText(
  tInsights: InsightTranslator,
  tConcerns: InsightTranslator,
  text: LocalizedInsightText,
): string {
  if (text.text) {
    return text.text;
  }

  const values = Object.fromEntries(
    Object.entries(text.values ?? {}).map(([key, value]) => [
      key,
      translateInsightValue(tInsights, tConcerns, key, value),
    ]),
  ) as Record<string, string | number>;

  try {
    return tInsights(stripInsightsPrefix(text.key), values);
  } catch {
    return text.key;
  }
}

export function insightMessageKey(key: string): string {
  return stripInsightsPrefix(key);
}
