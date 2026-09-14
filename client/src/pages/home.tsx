import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { Header } from "@/components/header";
import { CategoryFilter } from "@/components/category-filter";
import { WeekSelector } from "@/components/week-selector";
import { MonthCalendar } from "@/components/month-calendar";
import { EventGrid } from "@/components/event-grid";
import { EventGridSkeleton } from "@/components/event-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Footer } from "@/components/footer";
import { CalendarDays, UtensilsCrossed, Map as MapIcon, Megaphone, Users, Store } from "lucide-react";
import { RetailersSection } from "@/components/retailers-section";
import { RestaurantCard } from "@/components/restaurant-card";
import { SpecialCard } from "@/components/special-card";
import { SpecialsFilter } from "@/components/specials-filter";
import { RestaurantGridSkeleton, SpecialGridSkeleton } from "@/components/restaurant-skeleton";
import { 
  type Event, 
  type EventCategory, 
  type RestaurantWithSpecials,
  type Special,
  type SpecialType,
  eventCategories,
  specialTypes
} from "@shared/schema";

interface EventsResponse {
  events: Event[];
  lastUpdated: string;
}

interface RestaurantsResponse {
  restaurants: RestaurantWithSpecials[];
  lastUpdated: string;
}

interface SpecialsResponse {
  specials: (Special & { restaurantName: string })[];
  lastUpdated: string;
}

type TabType = "events" | "specials" | "retailers";

function initialTabFromUrl(): TabType {
  if (typeof window === "undefined") return "events";
  const t = new URLSearchParams(window.location.search).get("tab");
  return t === "specials" || t === "retailers" ? t : "events";
}

type EventsView = "week" | "month";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>(initialTabFromUrl);
  const [eventsView, setEventsView] = useState<EventsView>("week");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedSpecialType, setSelectedSpecialType] = useState<SpecialType | null>(null);
  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const { data: eventsData, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery<EventsResponse>({
    queryKey: ['/api/events', weekStart.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?weekStart=${weekStart.toISOString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
    enabled: activeTab === "events" && eventsView === "week",
  });

  const monthRange = useMemo(() => {
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const to = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return { from, to };
  }, [month]);

  const { data: monthData, isLoading: monthLoading, error: monthError, refetch: refetchMonth } = useQuery<EventsResponse>({
    queryKey: ['/api/events', 'month', monthRange.from.toISOString(), monthRange.to.toISOString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/events?from=${monthRange.from.toISOString()}&to=${monthRange.to.toISOString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
    enabled: activeTab === "events" && eventsView === "month",
  });

  const { data: restaurantsData, isLoading: restaurantsLoading, error: restaurantsError, refetch: refetchRestaurants } = useQuery<RestaurantsResponse>({
    queryKey: ['/api/restaurants'],
    queryFn: async () => {
      const response = await fetch('/api/restaurants');
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      return response.json();
    },
    enabled: activeTab === "specials",
  });

  const { data: specialsData, isLoading: specialsLoading, error: specialsError, refetch: refetchSpecials } = useQuery<SpecialsResponse>({
    queryKey: ['/api/specials'],
    queryFn: async () => {
      const response = await fetch('/api/specials');
      if (!response.ok) {
        throw new Error("Failed to fetch specials");
      }
      return response.json();
    },
    enabled: activeTab === "specials",
  });

  const filteredEvents = useMemo(() => {
    if (!eventsData?.events) return [];
    
    let events = eventsData.events;
    
    if (selectedCategory) {
      events = events.filter((event) => event.category === selectedCategory);
    }
    
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [eventsData?.events, selectedCategory]);

  const filteredSpecials = useMemo(() => {
    if (!specialsData?.specials) return [];
    
    let specials = specialsData.specials;
    
    if (selectedSpecialType) {
      specials = specials.filter((special) => special.type === selectedSpecialType);
    }
    
    return specials;
  }, [specialsData?.specials, selectedSpecialType]);

  const categoryCounts = useMemo(() => {
    if (!eventsData?.events) return {} as Record<EventCategory | "all", number>;
    
    const counts: Record<string, number> = { all: eventsData.events.length };
    
    eventCategories.forEach((category) => {
      counts[category] = eventsData.events.filter((e) => e.category === category).length;
    });
    
    return counts as Record<EventCategory | "all", number>;
  }, [eventsData?.events]);

  const specialTypeCounts = useMemo(() => {
    if (!specialsData?.specials) return {} as Record<SpecialType | "all", number>;
    
    const counts: Record<string, number> = { all: specialsData.specials.length };
    
    specialTypes.forEach((type) => {
      counts[type] = specialsData.specials.filter((s) => s.type === type).length;
    });
    
    return counts as Record<SpecialType | "all", number>;
  }, [specialsData?.specials]);

  const handleCategoryChange = (category: EventCategory | null) => {
    setSelectedCategory(category);
  };

  const handleSpecialTypeChange = (type: SpecialType | null) => {
    setSelectedSpecialType(type);
  };

  const handleWeekChange = (newWeekStart: Date) => {
    setWeekStart(newWeekStart);
    setSelectedCategory(null);
  };

  const handleSelectDay = (day: Date) => {
    setWeekStart(startOfWeek(day, { weekStartsOn: 0 }));
    setSelectedCategory(null);
    setEventsView("week");
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSpecialType(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSelectedSpecialType(null);
  };

  const lastUpdated = activeTab === "events" 
    ? (eventsView === "month" ? monthData?.lastUpdated : eventsData?.lastUpdated)
    : specialsData?.lastUpdated || restaurantsData?.lastUpdated;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <section className="relative z-10 -mt-1 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-5 lg:gap-16 items-start">
            <p className="font-utility text-[10px] font-medium uppercase tracking-[.17em] text-secondary">In the neighborhood</p>
            <div>
          <h3 className="font-editorial text-3xl md:text-5xl font-bold text-primary tracking-tight leading-[1.03]">
            Your town, with better timing.
          </h3>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            We know how easy it is to miss what's happening in Chappaqua. From the Library and town meetings to brunch
            specials, the farmers market, and the next show at CPAC — Chappaqua Pulse pulls it all together so
            you can show up, support local, and feel connected.
          </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border-l border-t border-border">
          <button onClick={() => handleTabChange("events")} className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-background hover:bg-accent transition-colors text-left" data-testid="tile-discover-events">
            <CalendarDays className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Discover Events</span>
          </button>
          <button onClick={() => handleTabChange("specials")} className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-secondary text-secondary-foreground hover:brightness-95 transition-colors text-left" data-testid="tile-dine-local">
            <UtensilsCrossed className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Dine Local</span>
          </button>
          <button onClick={() => handleTabChange("retailers")} className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-background hover:bg-accent transition-colors text-left" data-testid="tile-shop-local">
            <Store className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Shop Local</span>
          </button>
          <a href="/living-map.html" className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-primary text-primary-foreground hover:brightness-110 transition-colors text-left" data-testid="tile-explore-map">
            <MapIcon className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Explore the Map</span>
          </a>
          <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-background hover:bg-accent transition-colors text-left" data-testid="tile-promote-event">
            <Megaphone className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Promote an Event</span>
          </a>
          <a href="https://www.instagram.com/chappaqua_millwood_chamber/" target="_blank" rel="noopener noreferrer" className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-background hover:bg-accent transition-colors text-left" data-testid="tile-connect-chamber">
            <Users className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">Community</span>
          </a>
          <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="group flex min-h-28 flex-col items-start justify-between gap-2 py-5 px-4 border-r border-b border-border bg-background hover:bg-accent transition-colors text-left" data-testid="tile-list-business">
            <Store className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wide">List a Business</span>
          </a>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14">

          {activeTab === "events" && (
            <>
              <div className="flex items-end justify-between gap-4 pb-5">
                <div>
                  <p className="font-utility text-[10px] uppercase tracking-[.17em] text-secondary">What&apos;s on</p>
                  <h2 className="mt-2 font-editorial text-3xl md:text-4xl font-bold leading-none">Plan the week ahead</h2>
                </div>
                <div className="inline-flex rounded-full border border-border p-1 bg-card" role="tablist" aria-label="Event view">
                  <button
                    type="button"
                    onClick={() => setEventsView("week")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-[5px] transition-colors ${
                      eventsView === "week"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="button-view-week"
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventsView("month")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-[5px] transition-colors ${
                      eventsView === "month"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="button-view-month"
                  >
                    Month
                  </button>
                </div>
              </div>

              {eventsView === "week" && (
                <>
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

                  {eventsLoading && <EventGridSkeleton count={6} />}

                  {eventsError && (
                    <ErrorState onRetry={() => refetchEvents()} />
                  )}

                  {!eventsLoading && !eventsError && filteredEvents.length === 0 && (
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

                  {!eventsLoading && !eventsError && filteredEvents.length > 0 && (
                    <EventGrid events={filteredEvents} groupByDay={true} />
                  )}
                </>
              )}

              {eventsView === "month" && (
                <>
                  {monthError && (
                    <div className="pt-6">
                      <ErrorState onRetry={() => refetchMonth()} />
                    </div>
                  )}

                  {!monthError && (
                    <>
                      <MonthCalendar
                        month={month}
                        events={monthData?.events ?? []}
                        onMonthChange={setMonth}
                        onSelectDay={handleSelectDay}
                      />
                      {monthLoading && (
                        <p className="text-sm text-muted-foreground text-center pb-4" data-testid="text-month-loading">
                          Loading events…
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground text-center pb-2">
                        Tap any highlighted day to see that week's events.
                      </p>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "retailers" && <RetailersSection />}

          {activeTab === "specials" && (
            <>
              <div className="pb-7">
                <p className="font-utility text-[10px] uppercase tracking-[.17em] text-secondary mb-2">Around the table</p>
                <h2 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Dining & Specials
                </h2>
                <p className="text-muted-foreground">
                  Discover weekly specials, happy hours, and holiday menus from local Chappaqua restaurants
                </p>
              </div>

              <div className="mb-6">
                <SpecialsFilter
                  selectedType={selectedSpecialType}
                  onTypeChange={handleSpecialTypeChange}
                  typeCounts={specialTypeCounts}
                />
              </div>

              {(specialsLoading || restaurantsLoading) && (
                <SpecialGridSkeleton count={6} />
              )}

              {(specialsError || restaurantsError) && (
                <ErrorState 
                  title="Unable to load specials"
                  onRetry={() => {
                    refetchSpecials();
                    refetchRestaurants();
                  }} 
                />
              )}

              {!specialsLoading && !specialsError && filteredSpecials.length === 0 && (
                <EmptyState 
                  title={selectedSpecialType ? `No ${selectedSpecialType.replace('-', ' ')} specials` : "No specials available"}
                  description="Check back soon for new restaurant specials and promotions."
                  onReset={selectedSpecialType ? handleClearFilters : undefined}
                />
              )}

              {!specialsLoading && !specialsError && filteredSpecials.length > 0 && (
                <div className="space-y-12">
                  <section>
                    <h3 className="font-editorial text-2xl font-bold mb-5">Current Specials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSpecials.map((special) => (
                        <SpecialCard 
                          key={special.id} 
                          special={special} 
                          restaurantName={special.restaurantName}
                        />
                      ))}
                    </div>
                  </section>

                  {restaurantsData?.restaurants && restaurantsData.restaurants.length > 0 && (
                    <section>
                    <h3 className="font-editorial text-2xl font-bold mb-5">Local Restaurants</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurantsData.restaurants.map((restaurant) => (
                          <RestaurantCard 
                            key={restaurant.id} 
                            restaurant={restaurant}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer lastUpdated={lastUpdated ? new Date(lastUpdated) : undefined} />
    </div>
  );
}
