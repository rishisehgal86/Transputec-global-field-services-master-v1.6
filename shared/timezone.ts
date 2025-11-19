/**
 * Shared timezone utility functions for both client and server
 * This file can be imported by both frontend and backend code
 */

/**
 * Convert a datetime-local string (which has no timezone info) from a specific timezone to UTC
 * @param datetimeLocalString The datetime string from datetime-local input (format: "2024-01-15T14:30")
 * @param sourceTimezone The IANA timezone the user intended (e.g., "Asia/Dubai")
 * @returns Date object in UTC
 */
export function convertLocalTimeToUTC(datetimeLocalString: string, sourceTimezone: string): Date {
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
  
  // Create a date string
  const localDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  
  // Create the date as if it were in UTC (as a reference point)
  const utcDate = new Date(`${localDateStr}Z`);
  
  // Format it in the target timezone to see what time it shows
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: sourceTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(utcDate);
  const formattedHour = parseInt(parts.find(p => p.type === 'hour')!.value);
  const formattedMinute = parseInt(parts.find(p => p.type === 'minute')!.value);
  const formattedDay = parseInt(parts.find(p => p.type === 'day')!.value);
  
  // Calculate the difference between what we want (input) and what we got (formatted)
  const inputHour = parseInt(hour);
  const inputMinute = parseInt(minute);
  const inputDay = parseInt(day);
  
  // Calculate offset in minutes, accounting for day changes
  const dayDiff = formattedDay - inputDay;
  const offsetHours = formattedHour - inputHour + (dayDiff * 24);
  const offsetMinutes = formattedMinute - inputMinute;
  
  // Adjust the UTC date by subtracting the offset
  // If formatted time is ahead of input time, we need to go back
  const correctedUTC = new Date(
    utcDate.getTime() - (offsetHours * 60 * 60 * 1000) - (offsetMinutes * 60 * 1000)
  );
  
  return correctedUTC;
}

