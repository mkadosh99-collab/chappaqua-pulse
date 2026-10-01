import { type Event } from "@shared/schema";
import { EventCard } from "./event-card";
import { format, isSameDay } from "date-fns";

interface EventGridProps {
  events: Event[];
  groupByDay?: boolean;
}

export function EventGrid({ events, groupByDay = true }: EventGridProps) {
  if (!groupByDay) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }

  const groupedEvents = events.reduce((groups, event) => {
    const eventDate = new Date(event.date);
    const dateKey = format(eventDate, "yyyy-MM-dd");

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: eventDate,
        events: [],
      };
    }
    groups[dateKey].events.push(event);
    return groups;
  }, {} as Record<string, { date: Date; events: Event[] }>);

  const sortedDays = Object.entries(groupedEvents).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  const today = new Date();

  return (
    <div className="space-y-10">
      {sortedDays.map(([dateKey, { date, events: dayEvents }]) => {
        const isToday = isSameDay(date, today);

        return (
          <section key={dateKey} className="space-y-5">
            <div className="flex items-center gap-3">
              <h3
                className="font-editorial text-2xl font-bold sticky left-0"
                data-testid={`text-day-header-${dateKey}`}
              >
                {format(date, "EEEE, MMMM d")}
              </h3>
              {isToday && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-secondary text-secondary-foreground">
                  Today
                </span>
              )}
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
