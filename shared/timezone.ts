/**
 * Timezone utility functions for handling local and UTC time conversions
 * Shared between client and server
 */

import { find } from 'geo-tz';

/**
 * Get timezone from coordinates (latitude, longitude)
 * Returns IANA timezone like "America/New_York", "Europe/London", etc.
 */
export function getTimezoneFromCoordinates(lat: number, lng: number): string {
  try {
    const timezones = find(lat, lng);
    return timezones[0] || 'UTC';
  } catch (error) {
    console.error('Error detecting timezone from coordinates:', error);
    return 'UTC';
  }
}

/**
 * Get the user's detected IANA timezone
 * Returns timezone like "America/New_York", "Europe/London", etc.
 */
export function getClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC'; // Fallback to UTC if detection fails
  }
}

/**
 * Format a date to show both local time and UTC time
 * @param date - Date object or ISO string
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Object with formatted local and UTC strings
 */
export function formatDualTimezone(
  date: Date | string,
  timezone?: string
): {
  local: string;
  utc: string;
  localTimezone: string;
  localShort: string;
  utcShort: string;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tz = timezone || getClientTimezone();
  
  // Format for local timezone
  const localFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Format for UTC
  const utcFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Short format (time only)
  const localShortFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const utcShortFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return {
    local: localFormatter.format(dateObj),
    utc: utcFormatter.format(dateObj),
    localTimezone: tz,
    localShort: localShortFormatter.format(dateObj),
    utcShort: utcShortFormatter.format(dateObj),
  };
}

/**
 * Get timezone abbreviation (e.g., "EST", "PST", "GMT")
 */
export function getTimezoneAbbr(timezone?: string): string {
  const tz = timezone || getClientTimezone();
  const date = new Date();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || tz;
  } catch (error) {
    return tz;
  }
}

/**
 * Get UTC offset for a timezone (e.g., "+05:30", "-08:00")
 */
export function getUTCOffset(timezone?: string): string {
  const tz = timezone || getClientTimezone();
  const date = new Date();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    
    if (tzPart?.value) {
      // Extract offset from "GMT+05:30" format
      const match = tzPart.value.match(/GMT([+-]\d{1,2}:\d{2})/);
      return match ? match[1] : '+00:00';
    }
  } catch (error) {
    // Fallback calculation
    const offset = -date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  return '+00:00';
}

/**
 * Convert local datetime-local input value to UTC ISO string
 */
export function localToUTC(localDateTimeString: string, timezone?: string): string {
  const tz = timezone || getClientTimezone();
  
  // Parse the datetime-local value (format: "2025-01-13T14:30")
  const date = new Date(localDateTimeString);
  
  return date.toISOString();
}

/**
 * Convert UTC ISO string to local datetime-local input value
 */
export function utcToLocal(utcString: string, timezone?: string): string {
  const date = new Date(utcString);
  const tz = timezone || getClientTimezone();
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Format timestamp for display with dual timezone
 * Returns a human-readable string like:
 * "13 Jan 2025, 14:30 EST (19:30 UTC)"
 */
export function formatTimestampDual(
  date: Date | string,
  timezone?: string
): string {
  const { local, localShort, utcShort, localTimezone } = formatDualTimezone(date, timezone);
  const abbr = getTimezoneAbbr(timezone);
  
  return `${local} ${abbr} (${utcShort} UTC)`;
}

