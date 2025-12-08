import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Unable to load events",
  description = "We're having trouble fetching the latest events. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        
        <h3 
          className="text-lg font-semibold mb-2"
          data-testid="text-error-title"
        >
          {title}
        </h3>
        
        <p 
          className="text-muted-foreground max-w-md mb-6"
          data-testid="text-error-description"
        >
          {description}
        </p>

        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="gap-2"
            data-testid="button-retry"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
