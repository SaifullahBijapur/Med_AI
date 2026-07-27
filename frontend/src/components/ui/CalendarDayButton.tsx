import * as React from "react";
import { Button } from "@/components/ui/button";
import type { DayButton, Locale } from "react-day-picker";
import { cn } from "@/lib/utils";
import { getDefaultClassNames } from "react-day-picker";

type Props = React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>;
};

export function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: Props) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code ?? "en-US")}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square w-full min-w-(--cell-size) flex-col",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}