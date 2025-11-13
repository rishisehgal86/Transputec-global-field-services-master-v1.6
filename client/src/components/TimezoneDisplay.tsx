import { Clock, Globe } from "lucide-react";
import { formatDualTimezone, getTimezoneAbbr } from "@shared/timezone";

interface TimezoneDisplayProps {
  date: Date | string;
  timezone?: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Display a timestamp in both local timezone and UTC
 * Shows: "13 Jan 2025, 14:30 EST | 19:30 UTC"
 */
export function TimezoneDisplay({ date, timezone, showIcon = true, className = "" }: TimezoneDisplayProps) {
  const { local, utcShort, localTimezone } = formatDualTimezone(date, timezone);
  const abbr = getTimezoneAbbr(timezone);
  
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {showIcon && <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{local} {abbr}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {utcShort} UTC
        </span>
      </div>
    </div>
  );
}

interface TimezonePreviewProps {
  localDateTime: string; // datetime-local input value
  timezone?: string;
  className?: string;
}

/**
 * Preview component for datetime-local input
 * Shows what the selected time will be in both local and UTC
 */
export function TimezonePreview({ localDateTime, timezone, className = "" }: TimezonePreviewProps) {
  if (!localDateTime) return null;
  
  const date = new Date(localDateTime);
  const { local, utcShort } = formatDualTimezone(date, timezone);
  const abbr = getTimezoneAbbr(timezone);
  
  return (
    <div className={`mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="text-xs font-medium text-blue-900 mb-1">Scheduled Time (Site Location):</div>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">
            {local} <span className="text-blue-700">({abbr})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700">
            {utcShort} UTC
          </span>
        </div>
      </div>
    </div>
  );
}

