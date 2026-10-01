import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Sparkles, Sun, Coffee, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { type Special, type SpecialType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SpecialCardProps {
  special: Special;
  restaurantName?: string;
}

const specialTypeConfig: Record<SpecialType, { label: string; icon: typeof Sparkles; color: string }> = {
  weekly: {
    label: "Weekly Special",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  },
  holiday: {
    label: "Holiday Special",
    icon: PartyPopper,
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
  },
  "happy-hour": {
    label: "Happy Hour",
    icon: Sun,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  },
  brunch: {
    label: "Brunch",
    icon: Coffee,
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
  },
};

export function getSpecialTypeConfig(type: SpecialType) {
  return specialTypeConfig[type];
}

export function SpecialCard({ special, restaurantName }: SpecialCardProps) {
  const typeConfig = getSpecialTypeConfig(special.type);
  const Icon = typeConfig.icon;

  const formatDateRange = () => {
    if (!special.validFrom && !special.validTo) return null;

    if (special.validFrom && special.validTo) {
      return `${format(new Date(special.validFrom), "MMM d")} - ${format(new Date(special.validTo), "MMM d, yyyy")}`;
    }
    if (special.validFrom) {
      return `Starting ${format(new Date(special.validFrom), "MMM d, yyyy")}`;
    }
    if (special.validTo) {
      return `Until ${format(new Date(special.validTo), "MMM d, yyyy")}`;
    }
    return null;
  };

  const dateRange = formatDateRange();

  return (
    <Card
      className="guide-card group overflow-visible"
      data-testid={`card-special-${special.id}`}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <Badge
              variant="secondary"
              className={cn("shrink-0 gap-1.5", typeConfig.color)}
              data-testid={`badge-type-${special.id}`}
            >
              <Icon className="w-3 h-3" />
              {typeConfig.label}
            </Badge>
            {special.price && (
              <span className="text-sm font-semibold text-foreground" data-testid={`text-price-${special.id}`}>
                {special.price}
              </span>
            )}
          </div>

          <div>
            <h3
              className="font-editorial text-xl font-bold leading-[1.12] mb-1"
              data-testid={`text-title-${special.id}`}
            >
              {special.title}
            </h3>
            {restaurantName && (
              <p className="text-sm text-muted-foreground mb-2">
                at {restaurantName}
              </p>
            )}
            {special.description && (
              <p
                className="text-sm text-muted-foreground line-clamp-3"
                data-testid={`text-description-${special.id}`}
              >
                {special.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t paper-rule pt-4 text-sm">
            {dateRange && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span data-testid={`text-dates-${special.id}`}>{dateRange}</span>
              </div>
            )}

            {special.daysAvailable && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="w-4 h-4 shrink-0" />
                <span data-testid={`text-days-${special.id}`}>{special.daysAvailable}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
