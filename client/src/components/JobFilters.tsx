import { Calendar, AlertCircle, Clock, FileText, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type JobFilter = "all" | "today" | "urgent" | "overdue" | "pending" | "in_progress";

interface JobFiltersProps {
  activeFilter: JobFilter;
  onFilterChange: (filter: JobFilter) => void;
  counts?: {
    today?: number;
    urgent?: number;
    overdue?: number;
    pending?: number;
    in_progress?: number;
  };
}

const filterConfig: Record<JobFilter, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: "All Jobs", icon: FileText, color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  today: { label: "Today", icon: Calendar, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  urgent: { label: "Urgent", icon: AlertCircle, color: "bg-red-100 text-red-700 hover:bg-red-200" },
  overdue: { label: "Overdue", icon: Clock, color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  pending: { label: "Pending", icon: FileText, color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  in_progress: { label: "In Progress", icon: PlayCircle, color: "bg-green-100 text-green-700 hover:bg-green-200" },
};

export function JobFilters({ activeFilter, onFilterChange, counts }: JobFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {(Object.keys(filterConfig) as JobFilter[]).map((filter) => {
        const config = filterConfig[filter];
        const Icon = config.icon;
        const isActive = activeFilter === filter;
        const count = filter !== "all" && counts ? counts[filter as keyof typeof counts] : undefined;

        return (
          <Button
            key={filter}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter)}
            className={`${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : `${config.color} border-0`
            } transition-all`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {config.label}
            {count !== undefined && count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                isActive ? "bg-primary-foreground/20" : "bg-black/10"
              }`}>
                {count}
              </span>
            )}
            {isActive && filter !== "all" && (
              <X className="h-3 w-3 ml-2" onClick={(e) => {
                e.stopPropagation();
                onFilterChange("all");
              }} />
            )}
          </Button>
        );
      })}
    </div>
  );
}

