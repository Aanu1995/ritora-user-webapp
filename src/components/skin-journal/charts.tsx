"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Chip } from "./chip";
import { CONCERN_KEYS, type JournalEntry } from "@/types/skin-journal";

interface ChartFrameProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function ChartFrame({ title, children, footer }: ChartFrameProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="h-32">{children}</div>
      {footer ? <div className="mt-1.5">{footer}</div> : null}
    </div>
  );
}

interface JournalChartsProps {
  entries: JournalEntry[];
}

export function ConcernTrendChart({ entries }: JournalChartsProps) {
  const t = useTranslations("journal.insightsTab.charts");
  const tConcerns = useTranslations("journal.concerns");

  const data = useMemo(() => {
    return [...entries]
      .filter((e) => !!e.ratings)
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      .slice(-30)
      .map((e) => ({
        date: e.entry_date.slice(5),
        acne: e.ratings?.breakouts ?? null,
        redness: e.ratings?.redness ?? null,
        texture: e.ratings?.texture ?? null,
      }));
  }, [entries]);

  return (
    <ChartFrame
      title={t("trendTitle")}
      footer={
        <div className="flex flex-wrap gap-1.5">
          <Chip selected variant="accent">
            {tConcerns("breakouts")}
          </Chip>
          <Chip selected variant="warning">
            {tConcerns("redness")}
          </Chip>
          <Chip selected variant="ai">
            {tConcerns("texture")}
          </Chip>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 9 }} hide />
          <YAxis domain={[0, 5]} tick={{ fontSize: 9 }} hide />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          />
          <Line
            type="monotone"
            dataKey="acne"
            stroke="#2f7a52"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="redness"
            stroke="#b8540a"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="texture"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function ReactionFrequencyChart({ entries }: JournalChartsProps) {
  const t = useTranslations("journal.insightsTab.charts");

  const data = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const e of entries) {
      const week = isoWeek(e.entry_date);
      buckets.set(
        week,
        (buckets.get(week) ?? 0) + (e.has_reaction ? 1 : 0),
      );
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([k, v]) => ({ week: k, reactions: v }));
  }, [entries]);

  return (
    <ChartFrame title={t("reactionsTitle")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="week" tick={{ fontSize: 9 }} hide />
          <YAxis tick={{ fontSize: 9 }} hide />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          />
          <Bar dataKey="reactions" fill="#b8540a" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CheckInRadarChart({ entries }: JournalChartsProps) {
  const t = useTranslations("journal.insightsTab.charts");
  const tConcerns = useTranslations("journal.concerns");

  const radarData = useMemo(() => {
    const recent = entries.slice(0, 7);
    return CONCERN_KEYS.map((key) => {
      const sum = recent.reduce((acc, e) => acc + (e.ratings?.[key] ?? 0), 0);
      return {
        concern: tConcerns(key),
        value: recent.length > 0 ? sum / recent.length : 0,
      };
    });
  }, [entries, tConcerns]);

  return (
    <ChartFrame
      title={t("checkInTitle")}
      footer={
        <p className="text-xs text-muted">
          {t("thisWeek")} · {t("lastWeek")}
        </p>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} outerRadius="80%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="concern" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#2f7a52"
            fill="rgba(47,122,82,0.18)"
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function isoWeek(date: string): string {
  try {
    const d = new Date(`${date}T00:00:00Z`);
    const target = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
      ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
