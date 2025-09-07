// utils/formattedAirportArrivals.js

/**
 * Formats arrival data by adding arrivalTimeStatus with hourly ranges and status codes
 *
 * @param {Object[]} arrivals - Array of arrival flight objects (from fetchAirportArrivals)
 * @param {string|Date} currentTime - Current time at the airport in ISO string or Date object
 * @returns {Object[]} - Formatted array of arrival objects with arrivalTimeStatus + arrivalTimeStatusCode
 */
export function formatAirportArrivals(arrivals, currentTime) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);

  return arrivals.map((flight) => {
    let referenceTime = new Date(flight.arrivalScheduledTime);
    const scheduled = new Date(flight.arrivalScheduledTime);
    const delayMinutes = flight.arrivalDelay ?? 0;

    // Add 10 min margin
    const displayTimeMargin = 10 * 60 * 1000;
    referenceTime = new Date(
      scheduled.getTime() + delayMinutes * 60 * 1000 + displayTimeMargin
    );

    let arrivalTimeStatus;
    let arrivalTimeStatusCode;
    const diffMinutes = (referenceTime - now) / (1000 * 60); // positive = future, negative = past

    if (diffMinutes < 0) {
      // ===== Categorize "Previous" =====
      const pastMinutes = Math.abs(diffMinutes);
      if (pastMinutes <= 180) {
        arrivalTimeStatus = "0-3 hours ago";
        arrivalTimeStatusCode = 4;
      } else if (pastMinutes <= 360) {
        arrivalTimeStatus = "3-6 hours ago";
        arrivalTimeStatusCode = 3;
      } else if (pastMinutes <= 600) {
        arrivalTimeStatus = "6-12 hours ago";
        arrivalTimeStatusCode = 2;
      } else if (pastMinutes <= 900) {
        arrivalTimeStatus = "12-15 hours ago";
        arrivalTimeStatusCode = 1;
      } else {
        arrivalTimeStatus = "Previous";
        arrivalTimeStatusCode = 0;
      }
    } else {
      // ===== Categorize "Upcoming" =====
      if (diffMinutes <= 180) {
        arrivalTimeStatus = "0-3 hours ahead";
        arrivalTimeStatusCode = 5;
      } else if (diffMinutes <= 360) {
        arrivalTimeStatus = "3-6 hours ahead";
        arrivalTimeStatusCode = 6;
      } else if (diffMinutes <= 600) {
        arrivalTimeStatus = "6-12 hours ahead";
        arrivalTimeStatusCode = 7;
      } else if (diffMinutes <= 900) {
        arrivalTimeStatus = "12-15 hours ahead";
        arrivalTimeStatusCode = 8;
      } else {
        arrivalTimeStatus = "Recent";
        arrivalTimeStatusCode = 9;
      }
    }

    return {
      ...flight,
      arrivalTimeStatus,
      arrivalTimeStatusCode,
    };
  });
}
