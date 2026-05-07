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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedSpecialType, setSelectedSpecialType] = useState<SpecialType | null>(null);
  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const { data: eventsData, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery<EventsResponse>({
    queryKey: ['/api/events', weekStart.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?weekStart=${weekStart.toISOString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
    enabled: activeTab === "events",
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
    ? eventsData?.lastUpdated 
    : specialsData?.lastUpdated || restaurantsData?.lastUpdated;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Chamber-style benefits / discover tiles */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-primary tracking-tight">
            Everything around town, in one place.
          </h3>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We know how easy it is to miss what's happening in Chappaqua. From the Library and town meetings to brunch
            specials, the farmers market, and the next show at CPAC — Chappaqua Pulse pulls it all together so
            you can show up, support local, and feel connected.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-border">
          <button onClick={() => handleTabChange("events")} className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/85 transition-colors text-center" data-testid="tile-discover-events">
            <CalendarDays className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Discover Events</span>
          </button>
          <button onClick={() => handleTabChange("specials")} className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center" data-testid="tile-dine-local">
            <UtensilsCrossed className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Dine Local</span>
          </button>
          <button onClick={() => handleTabChange("retailers")} className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/85 transition-colors text-center" data-testid="tile-shop-local">
            <Store className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Shop Local</span>
          </button>
          <a href="/living-map.html" className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/85 transition-colors text-center" data-testid="tile-explore-map">
            <MapIcon className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Explore the Map</span>
          </a>
          <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center" data-testid="tile-promote-event">
            <Megaphone className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Promote an Event</span>
          </a>
          <a href="https://www.instagram.com/chappaqua_millwood_chamber/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/85 transition-colors text-center" data-testid="tile-connect-chamber">
            <Users className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Chamber & Community</span>
          </a>
          <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="group flex flex-col items-center justify-center gap-2 py-6 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center" data-testid="tile-list-business">
            <Store className="w-7 h-7" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">List Your Business</span>
          </a>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8">

          {activeTab === "events" && (
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

          {activeTab === "retailers" && <RetailersSection />}

          {activeTab === "specials" && (
            <>
              <div className="py-6">
                <h2 className="text-2xl font-semibold tracking-tight mb-2">
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
                    <h3 className="text-lg font-semibold mb-4">Current Specials</h3>
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
                      <h3 className="text-lg font-semibold mb-4">Local Restaurants</h3>
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
