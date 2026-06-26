import { type Event, type EventCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

const categoryDot: Record<EventCategory, string> = {
  community: "bg-blue-500",
  library: "bg-amber-500",
  "performing-arts": "bg-purple-500",
  recreation: "bg-green-500",
  schools: "bg-rose-500",
  government: "bg-slate-500",
  sports: "bg-orange-500",
  holiday: "bg-red-500",
};

interface MonthCalendarProps {
  month: Date;
  events: Event[];
  onMonthChange: (month: Date) => void;
  onSelectDay: (day: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ month, events, onMonthChange, onSelectDay }: MonthCalendarProps) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDay = events.reduce((map, event) => {
    const key = format(new Date(event.date), "yyyy-MM-dd");
    if (!map[key]) map[key] = [];
    map[key].push(event);
    return map;
  }, {} as Record<string, Event[]>);

  const isCurrentMonth = isSameMonth(month, new Date());

  return (
    <div className="py-6" data-testid="month-calendar">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMonthChange(addMonths(month, -1))}
              aria-label="Previous month"
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMonthChange(addMonths(month, 1))}
              aria-label="Next month"
              data-testid="button-next-month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight" data-testid="text-month-label">
            {format(month, "MMMM yyyy")}
          </h2>
        </div>

        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(startOfMonth(new Date()))}
            className="gap-2 w-fit"
            data-testid="button-this-month"
          >
            <Calendar className="h-4 w-4" />
            This month
          </Button>
        )}
      </div>

      <div className="grid grid-cols-7 border-l border-t border-border rounded-md overflow-hidden">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-r border-b border-border bg-muted/50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.charAt(0)}</span>
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[key] ?? [];
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => hasEvents && onSelectDay(day)}
              disabled={!hasEvents}
              className={[
                "border-r border-b border-border min-h-20 sm:min-h-28 p-1.5 text-left align-top flex flex-col gap-1 transition-colors",
                inMonth ? "bg-card" : "bg-muted/30",
                hasEvents ? "cursor-pointer hover-elevate" : "cursor-default",
              ].join(" ")}
              data-testid={`day-cell-${key}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={[
                    "inline-flex items-center justify-center text-xs font-medium h-6 w-6 rounded-full",
                    today
                      ? "bg-primary text-primary-foreground"
                      : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/60",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </span>
                {hasEvents && (
                  <span className="text-[10px] font-medium text-muted-foreground" data-testid={`day-count-${key}`}>
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-1 min-w-0"
                    title={event.title}
                  >
                    <span
                      className={`shrink-0 h-1.5 w-1.5 rounded-full ${categoryDot[event.category] ?? "bg-primary"}`}
                    />
                    <span className="truncate text-[11px] leading-tight text-foreground hidden sm:inline">
                      {event.title}
                    </span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
