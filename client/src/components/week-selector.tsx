import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, isSameWeek } from "date-fns";

interface WeekSelectorProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  eventCount?: number;
}

export function WeekSelector({ currentWeekStart, onWeekChange, eventCount }: WeekSelectorProps) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
  const today = new Date();
  const isCurrentWeek = isSameWeek(currentWeekStart, today, { weekStartsOn: 0 });

  const goToPreviousWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    onWeekChange(startOfWeek(today, { weekStartsOn: 0 }));
  };

  const formatWeekRange = () => {
    const startMonth = format(currentWeekStart, "MMM");
    const endMonth = format(weekEnd, "MMM");
    const startDay = format(currentWeekStart, "d");
    const endDay = format(weekEnd, "d");
    const year = format(currentWeekStart, "yyyy");

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextWeek}
            aria-label="Next week"
            data-testid="button-next-week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight" data-testid="text-week-range">
            {formatWeekRange()}
          </h2>
          {eventCount !== undefined && (
            <p className="text-sm text-muted-foreground" data-testid="text-event-count">
              {eventCount} {eventCount === 1 ? "event" : "events"} this week
            </p>
          )}
        </div>
      </div>

      {!isCurrentWeek && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="gap-2 w-fit"
          data-testid="button-today"
        >
          <Calendar className="h-4 w-4" />
          Today
        </Button>
      )}
    </div>
  );
}
