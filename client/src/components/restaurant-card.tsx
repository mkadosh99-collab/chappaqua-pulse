import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Clock, DollarSign, Utensils } from "lucide-react";
import { type RestaurantWithSpecials, type CuisineType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: RestaurantWithSpecials;
  onViewSpecials?: () => void;
}

const cuisineConfig: Record<CuisineType, { label: string; color: string }> = {
  italian: { label: "Italian", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  american: { label: "American", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  french: { label: "French", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  spanish: { label: "Spanish", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  mediterranean: { label: "Mediterranean", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  asian: { label: "Asian", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  mexican: { label: "Mexican", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  steakhouse: { label: "Steakhouse", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  seafood: { label: "Seafood", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  cafe: { label: "Cafe", color: "bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300" },
};

export function getCuisineConfig(cuisine: CuisineType) {
  return cuisineConfig[cuisine] || { label: cuisine, color: "bg-gray-100 text-gray-700" };
}

export function RestaurantCard({ restaurant, onViewSpecials }: RestaurantCardProps) {
  const cuisineInfo = getCuisineConfig(restaurant.cuisine);
  const activeSpecials = restaurant.specials?.filter(s => s.isActive) || [];

  return (
    <Card
      className="guide-card group overflow-visible"
      data-testid={`card-restaurant-${restaurant.id}`}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <Badge
              variant="secondary"
              className={cn("shrink-0 gap-1.5", cuisineInfo.color)}
              data-testid={`badge-cuisine-${restaurant.id}`}
            >
              <Utensils className="w-3 h-3" />
              {cuisineInfo.label}
            </Badge>
            {restaurant.priceRange && (
              <span className="text-sm font-medium text-muted-foreground">
                {restaurant.priceRange}
              </span>
            )}
          </div>

          <div>
            <h3
              className="font-editorial text-xl font-bold leading-[1.12] mb-2"
              data-testid={`text-name-${restaurant.id}`}
            >
              {restaurant.name}
            </h3>
            {restaurant.description && (
              <p
                className="text-sm text-muted-foreground line-clamp-2"
                data-testid={`text-description-${restaurant.id}`}
              >
                {restaurant.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t paper-rule pt-4 text-sm">
            {restaurant.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1" data-testid={`text-address-${restaurant.id}`}>
                  {restaurant.address}
                </span>
              </div>
            )}

            {restaurant.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <a
                  href={`tel:${restaurant.phone}`}
                  className="hover:text-foreground transition-colors"
                  data-testid={`link-phone-${restaurant.id}`}
                >
                  {restaurant.phone}
                </a>
              </div>
            )}

            {restaurant.hours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span data-testid={`text-hours-${restaurant.id}`}>{restaurant.hours}</span>
              </div>
            )}
          </div>

          {activeSpecials.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {activeSpecials.length} {activeSpecials.length === 1 ? 'Special' : 'Specials'} Available
                </Badge>
                {onViewSpecials && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewSpecials}
                    className="h-8 px-2 text-sm"
                    data-testid={`button-view-specials-${restaurant.id}`}
                  >
                    View Specials
                  </Button>
                )}
              </div>
            </div>
          )}

          {restaurant.website && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 -ml-2 text-sm gap-1.5"
              >
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-website-${restaurant.id}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Visit Website
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
