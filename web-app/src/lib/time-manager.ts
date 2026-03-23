// src/lib/time-manager.ts
import { DateTime } from 'luxon';

/**
 * Returns the current physical time adjusted to the family's geographical timezone.
 */
export const getLocalTime = (timezone: string = 'UTC') => {
    return DateTime.now().setZone(timezone);
};

/**
 * Checks if the current local time is past a given 24h deadline (e.g., "20:00").
 */
export const isPastDeadline = (deadlineStr: string, familyTimezone: string = 'UTC') => {
    const now = getLocalTime(familyTimezone);
    const [hours, minutes] = deadlineStr.split(':').map(Number);
    const deadline = now.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    
    return now > deadline;
};

/**
 * Gets the current business day status string for Dashboards.
 */
export const getBusinessDayStatus = (familyTimezone: string = 'UTC'): string => {
    const now = getLocalTime(familyTimezone);
    const hour = now.hour;
    const isWeekend = now.weekday === 6 || now.weekday === 7;

    if (isWeekend) return "Weekend Market - OTC Trading Only";
    if (hour >= 8 && hour < 17) return "Active Trading Hours";
    if (hour >= 17 && hour < 20) return "After Hours - R&D Only";
    return "Market Closed";
};
