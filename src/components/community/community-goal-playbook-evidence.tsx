import { Ban, Clock, Goal, Sparkles, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CommunityRoutine } from "@/types/community";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { Badge, Chip } from "./community-shared";

export function GoalPlaybookEvidence({ routine }: { routine: CommunityRoutine }) {
  const t = useTranslations("community.playbookEvidence");
  const options = useCommunityTranslatedOptions();
  return (
    <div className="mt-3 grid gap-2 text-xs">
      <div className="flex flex-wrap gap-1.5">
        {routine.goalTags.map((goal) => (
          <Badge key={goal} tone="accent">
            <Goal className="h-3 w-3" />
            {labelFromOptions(options.goals, goal) ?? humaniseCommunityTag(goal)}
          </Badge>
        ))}
        {routine.goalResult ? (
          <Badge tone="ai">
            <Sparkles className="h-3 w-3" />
            {labelFromOptions(options.goalResults, routine.goalResult) ??
              humaniseCommunityTag(routine.goalResult)}
          </Badge>
        ) : null}
        {routine.timeframe ? (
          <Badge tone="muted">
            <Clock className="h-3 w-3" />
            {labelFromOptions(options.goalTimeframes, routine.timeframe) ??
              humaniseCommunityTag(routine.timeframe)}
          </Badge>
        ) : null}
      </div>
      {routine.avoidTags.length > 0 ? (
        <TagRow
          icon={Ban}
          label={t("avoided")}
          options={options.avoidTags}
          tags={routine.avoidTags}
        />
      ) : null}
      {routine.habitTags.length > 0 ? (
        <TagRow
          icon={Sparkles}
          label={t("habits")}
          options={options.habits}
          tags={routine.habitTags}
        />
      ) : null}
      {routine.warningTags.length > 0 ? (
        <TagRow
          icon={TriangleAlert}
          label={t("warnings")}
          options={options.warnings}
          tags={routine.warningTags}
        />
      ) : null}
    </div>
  );
}

function TagRow({
  icon: Icon,
  label,
  options,
  tags,
}: {
  icon: typeof Ban;
  label: string;
  options: readonly { value: string; label: string }[];
  tags: string[];
}) {
  return (
    /* `min-w-0` on the row + tags container so the row can
       shrink inside its grid cell instead of pushing the
       parent wider. The chip container itself wraps tags,
       and individual chips truncate via `max-w-full`. */
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      {tags.slice(0, 5).map((tag) => {
        const display =
          labelFromOptions(options, tag) ?? humaniseCommunityTag(tag);
        return (
          <Chip
            key={tag}
            title={display}
            className="max-w-full truncate"
          >
            {display}
          </Chip>
        );
      })}
    </div>
  );
}
