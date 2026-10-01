import { Badge } from "@/components/ui/badge";
import { specialTypes, type SpecialType } from "@shared/schema";
import { Calendar, PartyPopper, Sun, Coffee, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialsFilterProps {
  selectedType: SpecialType | null;
  onTypeChange: (type: SpecialType | null) => void;
  typeCounts?: Record<SpecialType | "all", number>;
}

const typeConfig: Record<SpecialType, { label: string; icon: typeof Calendar }> = {
  weekly: { label: "Weekly", icon: Calendar },
  holiday: { label: "Holiday", icon: PartyPopper },
  "happy-hour": { label: "Happy Hour", icon: Sun },
  brunch: { label: "Brunch", icon: Coffee },
};

export function SpecialsFilter({
  selectedType,
  onTypeChange,
  typeCounts = {} as Record<SpecialType | "all", number>,
}: SpecialsFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Badge
        variant={selectedType === null ? "default" : "outline"}
        className={cn(
          "cursor-pointer shrink-0 gap-1.5 px-3 py-1.5",
          selectedType === null && "bg-primary text-primary-foreground"
        )}
        onClick={() => onTypeChange(null)}
        data-testid="filter-all-specials"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>All Specials</span>
        {typeCounts.all !== undefined && (
          <span className="ml-1 text-xs opacity-70">({typeCounts.all})</span>
        )}
      </Badge>

      {specialTypes.map((type) => {
        const config = typeConfig[type];
        const Icon = config.icon;
        const isSelected = selectedType === type;
        const count = typeCounts[type];

        return (
          <Badge
            key={type}
            variant="outline"
            className={cn(
              "cursor-pointer shrink-0 gap-1.5 px-3 py-1.5 transition-colors",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => onTypeChange(isSelected ? null : type)}
            data-testid={`filter-${type}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            {count !== undefined && count > 0 && (
              <span className="ml-1 text-xs opacity-70">({count})</span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
