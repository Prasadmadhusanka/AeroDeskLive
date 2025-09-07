// utils/calculateAirTime.js
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

/**
 * Calculate flight duration (air time) using start/end local times and coordinates
 * @param {string} startTime - e.g. "2025-08-25T15:00" (local origin time)
 * @param {number} startLat - origin latitude
 * @param {number} startLon - origin longitude
 * @param {string} endTime - e.g. "2025-08-26T07:00" (local destination time)
 * @param {number} endLat - destination latitude
 * @param {number} endLon - destination longitude
 */
export function calculateAirTime(startTime, startLat, startLon, endTime, endLat, endLon) {
  const startZone = tzlookup(startLat, startLon);
  const endZone = tzlookup(endLat, endLon);

  // Parse local times with correct timezone
  const start = DateTime.fromISO(startTime, { zone: startZone });
  const end = DateTime.fromISO(endTime, { zone: endZone });

  // Convert both to UTC
  const startUTC = start.toUTC();
  const endUTC = end.toUTC();

  // Calculate difference in minutes
  const diffMinutes = endUTC.diff(startUTC, "minutes").minutes;

  return {
    startZone,
    endZone,
    durationHours: Math.floor(diffMinutes / 60),
    durationMinutes: Math.round(diffMinutes % 60),
  };
}
