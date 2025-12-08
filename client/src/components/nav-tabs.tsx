import { Button } from "@/components/ui/button";
import { CalendarDays, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "events" | "specials";

interface NavTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 rounded-md transition-all",
          activeTab === "events" && "bg-background shadow-sm"
        )}
        onClick={() => onTabChange("events")}
        data-testid="tab-events"
      >
        <CalendarDays className="w-4 h-4" />
        Events
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 rounded-md transition-all",
          activeTab === "specials" && "bg-background shadow-sm"
        )}
        onClick={() => onTabChange("specials")}
        data-testid="tab-specials"
      >
        <UtensilsCrossed className="w-4 h-4" />
        Dining & Specials
      </Button>
    </div>
  );
}
