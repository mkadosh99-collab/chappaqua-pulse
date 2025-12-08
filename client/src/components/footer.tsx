import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface FooterProps {
  lastUpdated?: Date;
}

export function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>
              Events sourced from local Chappaqua organizations
            </span>
            {lastUpdated && (
              <span className="text-xs" data-testid="text-last-updated">
                Last updated: {format(lastUpdated, "MMM d, yyyy 'at' h:mm a")}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="https://www.mynewcastleny.gov/calendar.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-town-calendar"
            >
              Town of New Castle
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://www.chappaqualibrary.org/events"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-library"
            >
              Chappaqua Library
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://www.chappaquaschools.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-schools"
            >
              School District
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
