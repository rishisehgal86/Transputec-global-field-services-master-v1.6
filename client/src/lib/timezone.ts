/**
 * Timezone utility functions for displaying local and UTC times
 */

/**
 * Get the user's current timezone (IANA format)
 * @returns IANA timezone identifier (e.g., 'America/New_York', 'Asia/Dubai')
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone from coordinates using browser's timezone API
 * Falls back to user's timezone if lookup fails
 * @param lat Latitude
 * @param lng Longitude
 * @returns IANA timezone identifier
 */
export async function getTimezoneFromCoordinates(lat: string | number, lng: string | number): Promise<string> {
  try {
    // For now, use a simple API call to get timezone from coordinates
    // In production, you might want to use a dedicated timezone API
    const response = await fetch(`https://api.wheretheiss.at/v1/coordinates/${lat},${lng}`);
    if (response.ok) {
      const data = await response.json();
      if (data.timezone_id) {
        return data.timezone_id;
      }
    }
  } catch (error) {
    console.warn('Failed to get timezone from coordinates:', error);
  }
  
  // Fallback to user's timezone
  return getUserTimezone();
}

/**
 * Get timezone from coordinates synchronously using a simple heuristic
 * This is a rough approximation based on longitude
 * For accurate results, use getTimezoneFromCoordinates (async)
 */
export function estimateTimezoneFromLongitude(lng: string | number): string {
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  // Rough timezone estimation based on longitude
  // Each timezone is roughly 15 degrees of longitude
  const offsetHours = Math.round(longitude / 15);
  
  // Map common offsets to IANA timezones
  const timezoneMap: Record<string, string> = {
    '-12': 'Pacific/Wake',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Athens',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Singapore',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland',
  };
  
  return timezoneMap[offsetHours.toString()] || getUserTimezone();
}

/**
 * Get timezone abbreviation (e.g., 'EST', 'GST', 'UTC')
 * @param timezone IANA timezone identifier
 * @param date Date to get abbreviation for (defaults to now)
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Format a date in a specific timezone
 * @param date Date to format
 * @param timezone IANA timezone identifier
 * @param options Intl.DateTimeFormatOptions
 */
export function formatInTimezone(
  date: Date | string | null | undefined,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  } catch {
    return dateObj.toLocaleString();
  }
}

/**
 * Format date in UTC
 */
export function formatInUTC(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return formatInTimezone(date, 'UTC', options);
}

/**
 * Get UTC offset for a timezone at a specific date
 * @param timezone IANA timezone identifier
 * @param date Date to get offset for
 * @returns Offset string like '+04:00' or '-05:00'
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    if (offsetPart?.value && offsetPart.value.startsWith('GMT')) {
      return offsetPart.value.replace('GMT', '');
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Format a date showing both local timezone and UTC
 * @param date Date to format
 * @param localTimezone Local timezone (IANA format)
 * @param includeSeconds Whether to include seconds
 */
export interface DualTimeFormatOptions {
  includeSeconds?: boolean;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

export function formatDualTime(
  date: Date | string | null | undefined,
  localTimezone: string,
  options: DualTimeFormatOptions = {}
): { local: string; utc: string; localTz: string; utcOffset: string } {
  if (!date) {
    return { local: 'N/A', utc: 'N/A', localTz: '', utcOffset: '' };
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { local: 'Invalid Date', utc: 'Invalid Date', localTz: '', utcOffset: '' };
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options.includeSeconds && { second: '2-digit' }),
    hour12: true,
  };
  
  const local = formatInTimezone(dateObj, localTimezone, formatOptions);
  const utc = formatInUTC(dateObj, formatOptions);
  const localTz = getTimezoneAbbreviation(localTimezone, dateObj);
  const utcOffset = getTimezoneOffset(localTimezone, dateObj);
  
  return { local, utc, localTz, utcOffset };
}



/**
 * Convert a datetime-local string (which has no timezone info) from a specific timezone to UTC
 * @param datetimeLocalString The datetime string from datetime-local input (format: "2024-01-15T14:30")
 * @param sourceTimezone The IANA timezone the user intended (e.g., "Asia/Dubai")
 * @returns Date object in UTC
 */
export { convertLocalTimeToUTC } from '../../../shared/timezone';

/**
 * @deprecated Use the shared version from '../../../shared/timezone'
 */
function convertLocalTimeToUTC_OLD(datetimeLocalString: string, sourceTimezone: string): Date {
  // Parse the datetime-local string
  // datetime-local format: "2024-01-15T14:30"
  const [datePart, timePart] = datetimeLocalString.split('T');
  
  // If no time part, return a Date object with just the date
  if (!timePart) {
    const [year, month, day] = datePart.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  
  // Build an ISO string representing the time in the source timezone
  // We'll parse this string to get the components
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  
  // Create a formatter for the source timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: sourceTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'longOffset'
  });
  
  // Create a reference date to get the timezone offset
  const referenceDate = new Date(`${isoString}Z`); // Treat as UTC temporarily
  const parts = formatter.formatToParts(referenceDate);
  const tzNamePart = parts.find(p => p.type === 'timeZoneName');
  
  // Extract offset in minutes from GMT string (e.g., "GMT-05:00" or "GMT+04:00")
  let offsetMinutes = 0;
  if (tzNamePart && tzNamePart.value.includes('GMT')) {
    const offsetMatch = tzNamePart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (offsetMatch) {
      const sign = offsetMatch[1] === '+' ? 1 : -1;
      offsetMinutes = sign * (parseInt(offsetMatch[2]) * 60 + parseInt(offsetMatch[3]));
    } else if (tzNamePart.value === 'GMT' || tzNamePart.value === 'UTC') {
      // GMT or UTC without offset means +00:00
      offsetMinutes = 0;
    }
  }
  
  // The user entered time in the source timezone
  // To get UTC, we need to subtract the offset
  // Example: User enters 09:00 in EST (UTC-5)
  // UTC = 09:00 - (-5 hours) = 09:00 + 5 hours = 14:00
  const utcTimestamp = Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    0
  ) - (offsetMinutes * 60 * 1000);
  
  return new Date(utcTimestamp);
}



/**
 * Get a formatted UTC preview string from a datetime-local input value
 * This is specifically for displaying the UTC equivalent in forms
 * @param datetimeLocalString The datetime string from datetime-local input (format: "2024-01-15T14:30")
 * @param sourceTimezone The IANA timezone the time is in (e.g., "America/New_York")
 * @returns Formatted string like "Nov 15, 2024 at 7:30 PM UTC"
 */
export function getUTCPreviewText(datetimeLocalString: string, sourceTimezone: string): string {
  if (!datetimeLocalString || !sourceTimezone) return '';
  
  try {
    // Parse the datetime-local string
    const [datePart, timePart] = datetimeLocalString.split('T');
    
    // Check if we have both date and time parts
    if (!datePart || !timePart) return '';
    
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    // Get the timezone offset for this timezone
    // Create a date in UTC first
    const testDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    ));
    
    // Format it in the source timezone to get the offset
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'longOffset'
    });
    
    const parts = formatter.formatToParts(testDate);
    const tzNamePart = parts.find(p => p.type === 'timeZoneName');
    
    // Extract offset in minutes
    let offsetMinutes = 0;
    if (tzNamePart && tzNamePart.value.includes('GMT')) {
      const offsetMatch = tzNamePart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
      if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        offsetMinutes = sign * (parseInt(offsetMatch[2]) * 60 + parseInt(offsetMatch[3]));
      }
    }
    
    // Calculate UTC time by subtracting the offset
    // If timezone is GMT-5 (EST), offset is -300 minutes
    // To get UTC from local: UTC = local - offset = local - (-300) = local + 300
    let utcHour = parseInt(hour);
    let utcMinute = parseInt(minute);
    let utcDay = parseInt(day);
    let utcMonth = parseInt(month);
    let utcYear = parseInt(year);
    
    // Subtract offset to get UTC
    utcMinute -= offsetMinutes;
    
    // Handle minute overflow/underflow
    while (utcMinute >= 60) {
      utcMinute -= 60;
      utcHour += 1;
    }
    while (utcMinute < 0) {
      utcMinute += 60;
      utcHour -= 1;
    }
    
    // Handle hour overflow/underflow
    while (utcHour >= 24) {
      utcHour -= 24;
      utcDay += 1;
    }
    while (utcHour < 0) {
      utcHour += 24;
      utcDay -= 1;
    }
    
    // Create UTC date for formatting
    const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute));
    
    // Format the UTC date
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return utcFormatter.format(utcDate) + ' UTC';
  } catch (error) {
    console.error('Error calculating UTC preview:', error);
    return '';
  }
}

