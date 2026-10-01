import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { type Event } from "@shared/schema";
import { getCategoryConfig } from "./category-filter";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const categoryConfig = getCategoryConfig(event.category);
  const Icon = categoryConfig.icon;
  const eventDate = new Date(event.date);

  return (
    <Card
      className="guide-card group overflow-visible"
      data-testid={`card-event-${event.id}`}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <Badge
              variant="secondary"
              className={cn("shrink-0 gap-1.5", categoryConfig.color)}
              data-testid={`badge-category-${event.id}`}
            >
              <Icon className="w-3 h-3" />
              {categoryConfig.label}
            </Badge>
          </div>

          <div>
            <h3
              className="font-editorial text-xl font-bold leading-[1.12] line-clamp-2 mb-2"
              data-testid={`text-title-${event.id}`}
            >
              {event.title}
            </h3>
            {event.description && (
              <p
                className="text-sm text-muted-foreground line-clamp-2"
                data-testid={`text-description-${event.id}`}
              >
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t paper-rule pt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span data-testid={`text-date-${event.id}`}>
                {format(eventDate, "EEEE, MMMM d")}
              </span>
            </div>

            {event.time && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span data-testid={`text-time-${event.id}`}>{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span
                  className="line-clamp-1"
                  data-testid={`text-location-${event.id}`}
                >
                  {event.location}
                </span>
              </div>
            )}
          </div>

          {event.sourceUrl && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 -ml-2 text-sm gap-1.5"
              >
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-source-${event.id}`}
                >
                  Learn More
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
