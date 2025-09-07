// utils/timeDetailsOfLocation.js
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

/**
 * Get timezone info and full time at location A
 * @param {number} currentLat - Current location latitude
 * @param {number} currentLon - Current location longitude
 * @param {number} targetLat - Target location latitude (A)
 * @param {number} targetLon - Target location longitude (A)
 * @param {string} deviceDateTime - Device datetime in ISO format (e.g., "2025-08-27T12:30:00")
 * @returns {Object} { timezoneName, gmtOffset, fullTime }
 */
export function getLocationTimeInfo(
  currentLat,
  currentLon,
  targetLat,
  targetLon,
  deviceDateTime
) {
  try {
    // Find timezone of target location
    const timezoneName = tzlookup(targetLat, targetLon);

    // Interpret device datetime in current location's timezone
    const currentTz = tzlookup(currentLat, currentLon);
    const localDeviceTime = DateTime.fromISO(deviceDateTime, {
      zone: currentTz,
    });

    // Convert to target timezone
    const targetTime = localDeviceTime.setZone(timezoneName);

    return {
      timezoneName,
      gmtOffset: targetTime.offset*60,
      fullTime: targetTime.toFormat("yyyy-MM-dd HH:mm:ss"),
    };
  } catch (err) {
    console.error("Error getting location time info:", err);
    return null;
  }
}
