import { CalendarX2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyState({ 
  title = "No events this week",
  description = "There are no events scheduled for this time period. Try browsing other weeks or clearing your filters.",
  onReset
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
        <CalendarX2 className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 
        className="text-xl font-semibold mb-2"
        data-testid="text-empty-title"
      >
        {title}
      </h3>
      
      <p 
        className="text-muted-foreground max-w-md mb-6"
        data-testid="text-empty-description"
      >
        {description}
      </p>

      {onReset && (
        <Button 
          variant="outline" 
          onClick={onReset}
          className="gap-2"
          data-testid="button-clear-filters"
        >
          View All Events
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
