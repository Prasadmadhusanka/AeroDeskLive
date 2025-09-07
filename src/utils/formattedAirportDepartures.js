// utils/formattedAirportDepartures.js

/**
 * Formats departure data by adding departureTimeStatus with hourly ranges and status codes
 *
 * @param {Object[]} departures - Array of departure flight objects (from fetchAirportDepartures)
 * @param {string|Date} currentTime - Current time at the airport in ISO string or Date object
 * @returns {Object[]} - Formatted array of departure objects with departureTimeStatus + departureTimeStatusCode
 */
export function formatAirportDepartures(departures, currentTime) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);

  return departures.map((flight) => {
    let referenceTime = new Date(flight.departureScheduledTime);
    const scheduled = new Date(flight.departureScheduledTime);
    const delayMinutes = flight.departureDelay ?? 0;

    // Add 10 min margin
    const displayTimeMargin = 10 * 60 * 1000;
    referenceTime = new Date(
      scheduled.getTime() + delayMinutes * 60 * 1000 + displayTimeMargin
    );

    let departureTimeStatus;
    let departureTimeStatusCode;
    const diffMinutes = (referenceTime - now) / (1000 * 60); // positive = future, negative = past

    if (diffMinutes < 0) {
      // ===== Categorize "Previous" =====
      const pastMinutes = Math.abs(diffMinutes);
      if (pastMinutes <= 180) {
        departureTimeStatus = "0-3 hours ago";
        departureTimeStatusCode = 4;
      } else if (pastMinutes <= 360) {
        departureTimeStatus = "3-6 hours ago";
        departureTimeStatusCode = 3;
      } else if (pastMinutes <= 600) {
        departureTimeStatus = "6-12 hours ago";
        departureTimeStatusCode = 2;
      } else if (pastMinutes <= 900) {
        departureTimeStatus = "12-15 hours ago";
        departureTimeStatusCode = 1;
      } else {
        departureTimeStatus = "Previous";
        departureTimeStatusCode = 0;
      }
    } else {
      // ===== Categorize "Upcoming" =====
      if (diffMinutes <= 180) {
        departureTimeStatus = "0-3 hours ahead";
        departureTimeStatusCode = 5;
      } else if (diffMinutes <= 360) {
        departureTimeStatus = "3-6 hours ahead";
        departureTimeStatusCode = 6;
      } else if (diffMinutes <= 600) {
        departureTimeStatus = "6-12 hours ahead";
        departureTimeStatusCode = 7;
      } else if (diffMinutes <= 900) {
        departureTimeStatus = "12-15 hours ahead";
        departureTimeStatusCode = 8;
      } else {
        departureTimeStatus = "Recent";
        departureTimeStatusCode = 9;
      }
    }

    return {
      ...flight,
      departureTimeStatus,
      departureTimeStatusCode,
    };
  });
}
