import { DaypartIcon as ScheduleDaypartIcon } from "@/components/schedule/daypart-icon";
import { suggestionDaypartToScheduleDaypart } from "@/lib/suggestion-daypart";
import type { SuggestionDaypart } from "@/types/suggestions";

type Props = {
  daypart: SuggestionDaypart;
  size?: "sm" | "md";
  className?: string;
};

export function SuggestionDaypartIcon({ daypart, size, className }: Props) {
  return (
    <ScheduleDaypartIcon
      daypart={suggestionDaypartToScheduleDaypart(daypart)}
      size={size}
      className={className}
    />
  );
}
