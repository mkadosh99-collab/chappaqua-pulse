import { Badge } from "@/components/ui/badge";
import { eventCategories, type EventCategory } from "@shared/schema";
import { 
  Building2, 
  BookOpen, 
  Theater, 
  TreePine, 
  GraduationCap, 
  Landmark,
  LayoutGrid 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: EventCategory | null;
  onCategoryChange: (category: EventCategory | null) => void;
  categoryCounts?: Record<EventCategory | "all", number>;
}

const categoryConfig: Record<EventCategory, { label: string; icon: typeof Building2; color: string }> = {
  community: { 
    label: "Community", 
    icon: Building2,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  },
  library: { 
    label: "Library", 
    icon: BookOpen,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  },
  "performing-arts": { 
    label: "Arts", 
    icon: Theater,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
  },
  recreation: { 
    label: "Recreation", 
    icon: TreePine,
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  },
  schools: { 
    label: "Schools", 
    icon: GraduationCap,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  },
  government: { 
    label: "Government", 
    icon: Landmark,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
  },
};

export function getCategoryConfig(category: EventCategory) {
  return categoryConfig[category];
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  categoryCounts = {} as Record<EventCategory | "all", number>,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Badge
        variant={selectedCategory === null ? "default" : "outline"}
        className={cn(
          "cursor-pointer shrink-0 gap-1.5 px-3 py-1.5",
          selectedCategory === null && "bg-primary text-primary-foreground"
        )}
        onClick={() => onCategoryChange(null)}
        data-testid="filter-all"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>All Events</span>
        {categoryCounts.all !== undefined && (
          <span className="ml-1 text-xs opacity-70">({categoryCounts.all})</span>
        )}
      </Badge>
      
      {eventCategories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const isSelected = selectedCategory === category;
        const count = categoryCounts[category];
        
        return (
          <Badge
            key={category}
            variant="outline"
            className={cn(
              "cursor-pointer shrink-0 gap-1.5 px-3 py-1.5 transition-colors",
              isSelected && config.color
            )}
            onClick={() => onCategoryChange(isSelected ? null : category)}
            data-testid={`filter-${category}`}
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
