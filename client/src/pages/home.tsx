import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek } from "date-fns";
import { Header } from "@/components/header";
import { CategoryFilter } from "@/components/category-filter";
import { WeekSelector } from "@/components/week-selector";
import { EventGrid } from "@/components/event-grid";
import { EventGridSkeleton } from "@/components/event-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Footer } from "@/components/footer";
import { type Event, type EventCategory, eventCategories } from "@shared/schema";

interface EventsResponse {
  events: Event[];
  lastUpdated: string;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const { data, isLoading, error, refetch } = useQuery<EventsResponse>({
    queryKey: ['/api/events', weekStart.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?weekStart=${weekStart.toISOString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
  });

  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    
    let events = data.events;
    
    if (selectedCategory) {
      events = events.filter((event) => event.category === selectedCategory);
    }
    
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data?.events, selectedCategory]);

  const categoryCounts = useMemo(() => {
    if (!data?.events) return {} as Record<EventCategory | "all", number>;
    
    const counts: Record<string, number> = { all: data.events.length };
    
    eventCategories.forEach((category) => {
      counts[category] = data.events.filter((e) => e.category === category).length;
    });
    
    return counts as Record<EventCategory | "all", number>;
  }, [data?.events]);

  const handleCategoryChange = (category: EventCategory | null) => {
    setSelectedCategory(category);
  };

  const handleWeekChange = (newWeekStart: Date) => {
    setWeekStart(newWeekStart);
    setSelectedCategory(null);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <WeekSelector 
            currentWeekStart={weekStart}
            onWeekChange={handleWeekChange}
            eventCount={filteredEvents.length}
          />

          <div className="mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
            />
          </div>

          {isLoading && <EventGridSkeleton count={6} />}

          {error && (
            <ErrorState 
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <EmptyState 
              title={selectedCategory ? `No ${selectedCategory.replace('-', ' ')} events` : "No events this week"}
              description={
                selectedCategory 
                  ? "Try selecting a different category or browsing another week."
                  : "There are no events scheduled for this week. Try browsing other weeks."
              }
              onReset={selectedCategory ? handleClearFilters : undefined}
            />
          )}

          {!isLoading && !error && filteredEvents.length > 0 && (
            <EventGrid events={filteredEvents} groupByDay={true} />
          )}
        </div>
      </main>

      <Footer lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated) : undefined} />
    </div>
  );
}
