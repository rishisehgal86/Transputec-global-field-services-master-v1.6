import { Clock, Globe } from "lucide-react";
import { formatDualTime, getUserTimezone } from "@/lib/timezone";

interface DualTimeDisplayProps {
  date: Date | string | null | undefined;
  timezone?: string; // Site's local timezone (IANA format) - determined from site coordinates
  showIcon?: boolean;
  className?: string;
  layout?: 'stacked' | 'inline';
}

/**
 * Display a timestamp in both site's local timezone and UTC
 * Shows: "Dec 15, 2024, 02:30 PM GST (UTC+04:00) | 10:30 AM UTC"
 * Timezone is determined from the job site's coordinates, not the user's location
 */
export function DualTimeDisplay({
  date,
  timezone,
  showIcon = true,
  className = "",
  layout = 'stacked'
}: DualTimeDisplayProps) {
  // Use site's timezone if provided, otherwise fallback to user's timezone
  const localTz = timezone || getUserTimezone();
  
  const { local, utc, localTz: tzAbbr, utcOffset } = formatDualTime(date, localTz);
  
  if (local === 'N/A' || local === 'Invalid Date') {
    return <span className={`text-muted-foreground ${className}`}>{local}</span>;
  }
  
  if (layout === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {showIcon && <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        <span className="font-medium">{local}</span>
        <span className="text-muted-foreground">({tzAbbr})</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">{utc} UTC</span>
      </div>
    );
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        {showIcon && <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium">{local}</span>
          <span className="text-xs text-muted-foreground">
            {tzAbbr} {utcOffset && `(UTC${utcOffset})`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
        <Globe className="h-3 w-3 flex-shrink-0" />
        <span>{utc} UTC</span>
      </div>
    </div>
  );
}

/**
 * Compact version for tables and lists
 */
export function CompactDualTime({
  date,
  timezone,
  className = ""
}: Omit<DualTimeDisplayProps, 'showIcon' | 'layout'>) {
  const localTz = timezone || getUserTimezone();
  const { local, utc, localTz: tzAbbr } = formatDualTime(date, localTz);
  
  if (local === 'N/A' || local === 'Invalid Date') {
    return <span className={`text-muted-foreground text-xs ${className}`}>{local}</span>;
  }
  
  return (
    <div className={`text-xs ${className}`}>
      <div className="font-medium">{local} {tzAbbr}</div>
      <div className="text-muted-foreground">{utc} UTC</div>
    </div>
  );
}

/**
 * Single line version for tight spaces
 */
export function InlineDualTime({
  date,
  timezone,
  className = ""
}: Omit<DualTimeDisplayProps, 'showIcon' | 'layout'>) {
  const localTz = timezone || getUserTimezone();
  const { local, utc, localTz: tzAbbr } = formatDualTime(date, localTz);
  
  if (local === 'N/A' || local === 'Invalid Date') {
    return <span className={`text-muted-foreground text-xs ${className}`}>{local}</span>;
  }
  
  return (
    <span className={`text-xs ${className}`}>
      {local} {tzAbbr} <span className="text-muted-foreground">({utc} UTC)</span>
    </span>
  );
}

