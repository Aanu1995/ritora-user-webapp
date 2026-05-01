"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import {
  CONCERN_KEYS,
  CYCLE_MARKERS,
  SLEEP_BANDS,
  STRESS_LEVELS,
  SUN_EXPOSURES,
  type ConcernKey,
} from "@/types/skin-journal";
import { Button } from "@/components/ui/button";
import { Chip } from "./chip";
import { ConcernRatingRow } from "./concern-rating-row";
import { FeelPicker } from "./feel-picker";
import { RecentChangeInput } from "./recent-change-input";
import {
  checkInFormSchema,
  type CheckInFormValue,
} from "./daily-check-in-validation";

export {
  checkInToPayload,
  validateCheckInForSave,
} from "./daily-check-in-validation";
export type { CheckInFormValue } from "./daily-check-in-validation";

interface DailyCheckInFormProps {
  value: CheckInFormValue;
  onChange: (next: CheckInFormValue) => void;
  showCycle?: boolean;
}

export function DailyCheckInForm({
  value,
  onChange,
  showCycle = true,
}: DailyCheckInFormProps) {
  const t = useTranslations("journal.upload");
  const tConcerns = useTranslations("journal.concerns");
  const tCtx = useTranslations("journal.context");
  const [showNote, setShowNote] = useState(!!value.complaint_note);

  const form = useForm({
    defaultValues: value,
    validators: {
      onChange: checkInFormSchema,
      onSubmit: checkInFormSchema,
    },
  });

  const setRating = (
    values: CheckInFormValue,
    key: ConcernKey,
    n: 1 | 2 | 3 | 4 | 5,
  ) => {
    const ratings = { ...values.ratings, [key]: n };
    form.setFieldValue("ratings", ratings);
    onChange({
      ...values,
      ratings,
    });
  };

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => (
        <div className="divide-y divide-border [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold">
                {t("feelQuestion")}
              </p>
              <FeelPicker
                value={values.overall_feel}
                onChange={(feel) => {
                  form.setFieldValue("overall_feel", feel);
                  onChange({ ...values, overall_feel: feel });
                }}
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">
                {t("concernsQuestion")}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CONCERN_KEYS.map((key) => (
                  <ConcernRatingRow
                    key={key}
                    label={tConcerns(key)}
                    value={values.ratings?.[key] ?? null}
                    onChange={(n) => setRating(values, key, n)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">
              {t("contextQuestion")}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-muted">{tCtx("sleepLabel")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {SLEEP_BANDS.map((band) => (
                    <Chip
                      key={band}
                      asButton
                      selected={values.sleep_band === band}
                      onClick={() => {
                        form.setFieldValue("sleep_band", band);
                        onChange({ ...values, sleep_band: band });
                      }}
                    >
                      {tCtx(`sleep_${band}`)}
                    </Chip>
                  ))}
                </div>
                <p className="mb-2 mt-5 text-sm text-muted">
                  {tCtx("stressLabel")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STRESS_LEVELS.map((s) => (
                    <Chip
                      key={s}
                      asButton
                      selected={values.stress_today === s}
                      onClick={() => {
                        form.setFieldValue("stress_today", s);
                        onChange({ ...values, stress_today: s });
                      }}
                    >
                      {tCtx(`stress_${s}`)}
                    </Chip>
                  ))}
                </div>
                <p className="mb-2 mt-5 text-sm text-muted">
                  {tCtx("sunLabel")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUN_EXPOSURES.map((s) => (
                    <Chip
                      key={s}
                      asButton
                      selected={values.sun_exposure_today === s}
                      onClick={() => {
                        form.setFieldValue("sun_exposure_today", s);
                        onChange({ ...values, sun_exposure_today: s });
                      }}
                    >
                      {tCtx(`sun_${s}`)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">
                  {tCtx("sweatLabel")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Chip
                    asButton
                    selected={values.sweat_exercise_today === false}
                    onClick={() => {
                      form.setFieldValue("sweat_exercise_today", false);
                      onChange({ ...values, sweat_exercise_today: false });
                    }}
                  >
                    {tCtx("sweat_no")}
                  </Chip>
                  <Chip
                    asButton
                    selected={values.sweat_exercise_today === true}
                    onClick={() => {
                      form.setFieldValue("sweat_exercise_today", true);
                      onChange({ ...values, sweat_exercise_today: true });
                    }}
                  >
                    {tCtx("sweat_yes")}
                  </Chip>
                </div>

                {showCycle ? (
                  <>
                    <p className="mb-2 mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span>{tCtx("cycleLabel")}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
                        <span aria-hidden>🔒</span>
                        {tCtx("cycleFromProfileBadge")}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CYCLE_MARKERS.map((c) => (
                        <Chip
                          key={c}
                          asButton
                          selected={values.cycle_marker === c}
                          onClick={() => {
                            form.setFieldValue("cycle_marker", c);
                            onChange({ ...values, cycle_marker: c });
                          }}
                        >
                          {tCtx(`cycle_${c}`)}
                        </Chip>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <RecentChangeInput
              value={values.recent_change ?? null}
              onChange={(next) => {
                form.setFieldValue("recent_change", next);
                onChange({ ...values, recent_change: next });
              }}
            />
          </div>

          <div>
            {!showNote ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-xs"
                onClick={() => setShowNote(true)}
              >
                + {t("addNote")}
              </Button>
            ) : (
              <>
                <label className="mb-2 block text-sm font-semibold">
                  {t("noteLabel")}
                </label>
                <textarea
                  rows={3}
                  placeholder={t("notePlaceholder")}
                  value={values.complaint_note ?? ""}
                  onChange={(e) => {
                    form.setFieldValue("complaint_note", e.target.value);
                    onChange({ ...values, complaint_note: e.target.value });
                  }}
                  className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                />
              </>
            )}
          </div>
        </div>
      )}
    </form.Subscribe>
  );
}
