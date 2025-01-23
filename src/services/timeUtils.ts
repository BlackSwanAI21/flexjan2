import { format, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface TimeData {
  todays_date: string;      // Full date in user's timezone
  todays_day: string;       // Day of week
  next_6_days: string[];    // Array of next 6 days with dates
}

/**
 * Get current time data in the specified timezone
 * @param timezone The timezone to use (e.g., 'Europe/London')
 * @returns TimeData object with today's date, day, and next 6 days
 */
export function getCurrentTimeData(timezone: string): TimeData {
  // Get current date in the specified timezone
  const utcDate = new Date();
  const zonedDate = toZonedTime(utcDate, timezone);

  // Format today's date
  const todays_date = format(zonedDate, 'dd-MMM-yyyy');
  const todays_day = format(zonedDate, 'EEEE');

  // Get next 6 days
  const next_6_days = Array.from({ length: 6 }, (_, i) => {
    const nextDate = addDays(zonedDate, i + 1);
    const dayName = format(nextDate, 'EEEE');
    const dateStr = format(nextDate, 'dd-MMM-yyyy');
    return `${dayName} (${dateStr})`;
  });

  return {
    todays_date,
    todays_day,
    next_6_days
  };
}

/**
 * Format a date in both required formats
 * @param date The date to format
 * @param timezone The timezone to use
 * @returns Object with both formatted strings
 */
export function formatDateForBooking(date: Date | 'now', timezone: string): {
  formatted: string;  // DD-MMM-YYYY HH:MM or 'now'
  iso8601: string;   // yyyy-MM-ddTHH:mm:ss or 'now'
} {
  if (date === 'now') {
    return {
      formatted: 'now',
      iso8601: 'now'
    };
  }

  const zonedDate = toZonedTime(date, timezone);
  
  return {
    formatted: format(zonedDate, 'dd-MMM-yyyy hh:mm a'),
    iso8601: format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss")
  };
}

/**
 * Parse a date string in either format and convert to Date object or 'now'
 * @param dateStr The date string to parse
 * @param timezone The timezone to use
 * @returns Date object or 'now' string
 */
export function parseBookingDate(dateStr: string, timezone: string): Date | 'now' | null {
  try {
    // If it's "now", return the string 'now'
    if (dateStr.toLowerCase() === 'now') {
      return 'now';
    }

    // Try parsing the ISO format first
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      return date.getTime() ? date : null;
    }

    // Parse the DD-MMM-YYYY HH:MM format
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
} 