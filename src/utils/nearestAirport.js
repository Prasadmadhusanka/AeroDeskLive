// utils/nearestAirport.js
import { fetchWorldAirports } from "./worldAirportData.js";

/**
 * Fetches nearest airport using Aviation Edge API for a given latitude and longitude,
 * matches them with world airport data, and returns the closest matching airport
 *
 * @async
 * @function fetchNearestAirport
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @returns {Promise<Object|null>} - Promise resolving to closest matched airport object or null if none found
 */
export async function fetchNearestAirport(lat, lng) {
  const apiKey = import.meta.env.VITE_AVIATION_EDGE_API_KEY;
  const url = `https://aviation-edge.com/v2/public/nearby?key=${apiKey}&lat=${lat}&lng=${lng}&distance=300`;

  try {
    // Step 1: Fetch both datasets in parallel
    const [nearbyResponse, worldAirports] = await Promise.all([
      fetch(url),
      fetchWorldAirports(),
    ]);

    if (!nearbyResponse.ok) {
      throw new Error(`HTTP error! Status: ${nearbyResponse.status}`);
    }

    const nearbyAirports = await nearbyResponse.json();

    // Check if response is an array
    if (!Array.isArray(nearbyAirports)) {
      throw new Error("Invalid API response format");
    }

    // Step 2 & 3: Match nearby airports with world airports by IATA code
    const matchedAirports = nearbyAirports
      .map((nearbyAirport) => {
        // Find matching world airport
        const worldAirport = worldAirports.find(
          (wa) => wa.iata_code === nearbyAirport.codeIataAirport
        );

        if (!worldAirport) return null;

        // Step 5: Combine attributes from both datasets
        return {
          type: worldAirport.type,
          name: worldAirport.name,
          latitude_deg: worldAirport.latitude_deg,
          longitude_deg: worldAirport.longitude_deg,
          elevation_ft: worldAirport.elevation_ft,
          continent: worldAirport.continent,
          country_name: worldAirport.country_name,
          iso_country: worldAirport.iso_country,
          region_name: worldAirport.region_name,
          iso_region: worldAirport.iso_region,
          municipality: worldAirport.municipality,
          icao_code: worldAirport.icao_code,
          iata_code: worldAirport.iata_code,
          home_link: worldAirport.home_link,
          wikipedia_link: worldAirport.wikipedia_link,
          distanceToAirport: nearbyAirport.distance,
        };
      })
      .filter((airport) => airport !== null); // Remove non-matching airports

    if (matchedAirports.length === 0) {
      console.warn(
        "No matching airports found between nearby and world datasets"
      );
      return null;
    }

    // Step 4: Sort by distance and select closest
    matchedAirports.sort((a, b) => a.distanceToAirport - b.distanceToAirport);
    const closestAirport = matchedAirports[0];

    // console.log("Closest matched airport:", closestAirport);
    return closestAirport;
  } catch (error) {
    console.error("Error fetching and processing nearby airports:", error);
    return null;
  }
}
