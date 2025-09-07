// utils/airportArrivals.js
import { fetchWorldAirports } from "./worldAirportData.js";
import { calculateAirTime } from "./calculateAirTime.js";

/**
 * Fetches arrival flights for a specific airport from Aviation Edge API
 *
 * @async
 * @function fetchAirportArrivals
 * @param {string} iataCode - IATA code of the airport (e.g., 'JFK')
 * @returns {Promise<Object[]>} - Promise resolving to array of arrival flight objects
 */
export async function fetchAirportArrivals(iataCode) {
  const apiKey = import.meta.env.VITE_AVIATION_EDGE_API_KEY;
  const url = `https://aviation-edge.com/v2/public/timetable?key=${apiKey}&iataCode=${iataCode}&type=arrival`;

  try {
    // Step 1: Fetch world airports data
    const worldAirports = await fetchWorldAirports();

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid API response format");

    // Step 2: Filter and format the data
    let arrivalData = data
      .filter(
        (flight) =>
          flight.codeshared === null && flight.departure.iataCode !== "NUF"
      )
      .map((flight) => ({
        airlineIataCode: flight.airline.iataCode || flight.airline.icaoCode,
        airlineIcaoCode: flight.airline.icaoCode,
        airlineName: flight.airline.name,
        flightIataNumber: flight.flight.iataNumber || flight.flight.icaoNumber,
        flightIcaoNumber: flight.flight.icaoNumber,
        arrivalAirportIataCode: flight.arrival.iataCode,
        arrivalAirportIcaoCode: flight.arrival.icaoCode,
        arrivalScheduledTime: flight.arrival.scheduledTime,
        arrivalEstimatedTime: flight.arrival.estimatedTime,
        arrivalDelay: flight.arrival.delay
          ? Number(flight.arrival.delay)
          : null,
        arrivalTerminal: flight.arrival.terminal ?? null,
        arrivalGate: flight.arrival.gate ?? null,
        departureAirportIataCode: flight.departure.iataCode,
        departureAirportIcaoCode: flight.departure.icaoCode,
        departureScheduledTime: flight.departure.scheduledTime,
        departureEstimatedTime: flight.departure.estimatedTime,
        departureDelay: flight.departure.delay
          ? Number(flight.departure.delay)
          : null,
        departureTerminal: flight.departure.terminal ?? null,
        departureGate: flight.departure.gate ?? null,
        flightStatus: flight.status,
        typeDepartureArrival: flight.type,
      }));

    // Step 3: Build a map for faster airport lookups
    const airportMap = new Map();
    worldAirports.forEach((airport) =>
      airportMap.set(airport.iata_code, airport)
    );

    // Step 4: Enhance arrivalData with airport details and intersectionIDL
    arrivalData = arrivalData.map((flight) => {
      const arrivalAirport = airportMap.get(flight.arrivalAirportIataCode);
      const departureAirport = airportMap.get(flight.departureAirportIataCode);

      const departureLat = departureAirport?.latitude_deg;
      const departureLon = departureAirport?.longitude_deg;
      const arrivalLat = arrivalAirport?.latitude_deg;
      const arrivalLon = arrivalAirport?.longitude_deg;

      // Calculate if flight crosses International Date Line
      let intersectionIDL = null;
      if (departureLon != null && arrivalLon != null) {
        const lonDiff = Math.abs(departureLon - arrivalLon);
        intersectionIDL = lonDiff > 180 ? "yes" : "no";
      }

      // Calculate flight duration in minutes (using scheduled times & coords)
      let flightDuration = null;
      if (
        flight.departureScheduledTime &&
        flight.arrivalScheduledTime &&
        departureLat != null &&
        departureLon != null &&
        arrivalLat != null &&
        arrivalLon != null
      ) {
        try {
          const duration = calculateAirTime(
            flight.departureScheduledTime,
            departureLat,
            departureLon,
            flight.arrivalScheduledTime,
            arrivalLat,
            arrivalLon
          );
          flightDuration = Math.round(
            duration.durationHours * 60 + duration.durationMinutes
          );
        } catch (err) {
          console.warn("Error calculating flight duration:", err);
          flightDuration = null;
        }
      }

      return {
        ...flight,
        // Arrival airport details
        arrivalAirportType: arrivalAirport?.type || null,
        arrivalAirportLatitude: arrivalAirport?.latitude_deg || null,
        arrivalAirportLongitude: arrivalAirport?.longitude_deg || null,
        arrivalAirportName: arrivalAirport?.name || null,
        arrivalAirportContinent: arrivalAirport?.continent || null,
        arrivalAirportCountry: arrivalAirport?.country_name || null,
        arrivalAirportCountryCode: arrivalAirport?.iso_country || null,
        arrivalAirportMunicipality: arrivalAirport?.municipality || null,
        arrivalAirportRegion: arrivalAirport?.region_name || null,

        // Departure airport details
        departureAirportType: departureAirport?.type || null,
        departureAirportLatitude: departureAirport?.latitude_deg || null,
        departureAirportLongitude: departureAirport?.longitude_deg || null,
        departureAirportName: departureAirport?.name || null,
        departureAirportContinent: departureAirport?.continent || null,
        departureAirportCountry: departureAirport?.country_name || null,
        departureAirportCountryCode: departureAirport?.iso_country || null,
        departureAirportMunicipality: departureAirport?.municipality || null,
        departureAirportRegion: departureAirport?.region_name || null,

        // New field
        intersectionIDL,
        flightDuration, // duration in minutes
      };
    });

    // console.log(`Non-codeshare arrivals to ${iataCode}:`, arrivalData);
    return arrivalData;
  } catch (error) {
    console.error(
      `Error fetching non-codeshare arrivals for ${iataCode}:`,
      error
    );
    return [];
  }
}
