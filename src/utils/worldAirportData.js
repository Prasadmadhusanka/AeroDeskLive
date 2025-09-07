// utils/worldAirportData.js
/**
 * Fetches airport data from S3 bucket and returns an array of airport objects
 *
 * Each airport object contains the following 15 attributes:
 * type, name, latitude_deg, longitude_deg, elevation_ft,
 * continent, country_name, iso_country, region_name, iso_region,
 * municipality, icao_code, iata_code, home_link, wikipedia_link
 *
 * @async
 * @function fetchAirports
 * @returns {Promise<Array<Object>>} - Promise resolving to an array of airport objects
 */
export async function fetchWorldAirports() {
  const url =
    "https://worldairportsdata.s3.eu-central-1.amazonaws.com/world_airports_clean5.json";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const outputData = data.map((airport) => ({
      type: airport.type,
      name: airport.name,
      latitude_deg: airport.latitude_deg,
      longitude_deg: airport.longitude_deg,
      elevation_ft: airport.elevation_ft,
      continent: airport.continent,
      country_name: airport.country_name,
      iso_country: airport.iso_country,
      region_name: airport.region_name,
      iso_region: airport.iso_region,
      municipality: airport.municipality,
      icao_code: airport.icao_code,
      iata_code: airport.iata_code,
      home_link: airport.home_link,
      wikipedia_link: airport.wikipedia_link,
      country_name_new: airport.country_name_new,
    }));

    // console.log(outputData);

    return outputData;
  } catch (error) {
    console.error("Error fetching airport data:", error);
    return [];
  }
}
