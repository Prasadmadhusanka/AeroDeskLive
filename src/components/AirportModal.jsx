import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import {
  WiHumidity,
  WiBarometer,
  WiStrongWind,
  WiDaySunny,
  WiSunrise,
  WiSunset,
} from "react-icons/wi";
import {
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaPlaneDeparture,
  FaEye,
  FaExternalLinkAlt,
  FaLink,
  FaGlobe,
  FaMap,
} from "react-icons/fa";
import {
  MdTerrain,
  MdLocationCity,
  MdPublic,
  MdAccessTime,
  MdLocationPin,
} from "react-icons/md";
import { fetchWeatherConditions } from "../utils/weatherAPI";
import styles from "../styles/component_styles/AirportModal.module.css";

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return distanceKm.toFixed(2);
};

// Format GMT offset
const formatGMTOffset = (offsetSeconds) => {
  if (typeof offsetSeconds !== "number") return "(GMT Unknown)";
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetSeconds);
  const hours = Math.floor(absOffset / 3600);
  const minutes = Math.floor((absOffset % 3600) / 60);
  return `(GMT${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")})`;
};

// Format datetime into 12-hour format with weekday
const formatLocalDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const dateObj = new Date(dateString);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekday = weekdays[dateObj.getDay()];

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${year}-${month}-${day} (${weekday}) ${hours
    .toString()
    .padStart(2, "0")}:${minutes}${ampm}`;
};

const AirportModal = ({
  show,
  onHide,
  airportInfo,
  locationTimeDetails,
  currentGPS,
}) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);
  const [currentTime, setCurrentTime] = useState(locationTimeDetails?.fullTime);

  // Weather fetch
  useEffect(() => {
    if (show && airportInfo?.latitude_deg && airportInfo?.longitude_deg) {
      setLoading(true);
      fetchWeatherConditions(
        airportInfo.latitude_deg,
        airportInfo.longitude_deg
      ).then((data) => {
        setWeather(data);
        setLoading(false);
      });
    }
  }, [show, airportInfo]);

  // Distance calculation
  useEffect(() => {
    if (
      currentGPS?.lat != null &&
      currentGPS?.lng != null &&
      airportInfo?.latitude_deg != null &&
      airportInfo?.longitude_deg != null
    ) {
      const dist = calculateDistance(
        currentGPS.lat,
        currentGPS.lng,
        airportInfo.latitude_deg,
        airportInfo.longitude_deg
      );
      setDistance(dist);
    }
  }, [currentGPS, airportInfo]);

  // Time updater
  useEffect(() => {
    if (locationTimeDetails?.fullTime) {
      setCurrentTime(locationTimeDetails.fullTime);

      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newDate = new Date(prev);
          newDate.setMinutes(newDate.getMinutes() + 1);
          return newDate.toISOString();
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [locationTimeDetails]);

  // Format GPS
  const formatCoordinates = (lat, lon) => {
    if (lat == null || lon == null) return "N/A";
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(
      4
    )}° ${lonDir}`;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="airport-modal"
      className={styles.modal}
      centered
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        {airportInfo && (
          <Modal.Title className={styles.modalTitle}>
            <div className={styles.titleContent}>
              <div className={styles.titleText}>
                <span className={styles.airportName}>
                  {`${airportInfo.name} (${airportInfo.iata_code})`}
                </span>
                <div className={styles.countryRow}>
                  <span className={styles.airportLocation}>
                    {`${airportInfo.region_name}, ${airportInfo.country_name}`}
                  </span>
                  {airportInfo.iso_country && (
                    <>
                      <img
                        src={`https://flagsapi.com/${airportInfo.iso_country}/shiny/64.png`}
                        alt={`Flag of ${airportInfo.country_name}`}
                        className={styles.flag}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div className={styles.countryFallback}>
                        {airportInfo.iso_country}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Modal.Title>
        )}
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {airportInfo ? (
          <div className={styles.detailsWrapper}>
            {/* Airport Info Section */}
            <div className={styles.section}>
              <h5 className={styles.sectionTitle}>
                <FaPlaneDeparture className={styles.sectionIcon} />
                Airport Details
              </h5>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FaPlaneDeparture />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Airport Type</span>
                    <span className={styles.infoValue}>{airportInfo.type}</span>
                  </div>
                </div>

                {airportInfo.iata_code && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaGlobeAmericas />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Iata Code</span>
                      <span className={styles.infoValue}>
                        {airportInfo.iata_code}
                      </span>
                    </div>
                  </div>
                )}

                {airportInfo.icao_code && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaGlobeAmericas />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>ICAO Code</span>
                      <span className={styles.infoValue}>
                        {airportInfo.icao_code}
                      </span>
                    </div>
                  </div>
                )}

                {locationTimeDetails && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaGlobe />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>TimeZone</span>
                      <span className={styles.infoValue}>
                        {locationTimeDetails.timezoneName}
                      </span>
                      <span className={styles.infoValue}>
                        {formatGMTOffset(locationTimeDetails.gmtOffset)}
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <MdAccessTime />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Current Date/ Time</span>
                    <span className={styles.infoValue}>
                      {formatLocalDateTime(currentTime)}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <MdTerrain />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Elevation</span>
                    <span className={styles.infoValue}>
                      {airportInfo.elevation_ft
                        ? `${airportInfo.elevation_ft} ft`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FaMapMarkerAlt />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>GPS Coordinates</span>
                    <span className={styles.infoValue}>
                      {formatCoordinates(
                        airportInfo.latitude_deg,
                        airportInfo.longitude_deg
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <MdLocationCity />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Municipality</span>
                    <span className={styles.infoValue}>
                      {airportInfo.municipality || "N/A"}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <FaMap />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Region</span>
                    <span className={styles.infoValue}>
                      {airportInfo.region_name || "N/A"}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <MdPublic />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Continent</span>
                    <span className={styles.infoValue}>
                      {airportInfo.continent || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Website */}
                {airportInfo.home_link && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaLink />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Website</span>
                      <span className={styles.infoValue}>
                        <a
                          href={airportInfo.home_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Visit Website{" "}
                          <FaExternalLinkAlt className={styles.linkIcon} />
                        </a>
                      </span>
                    </div>
                  </div>
                )}

                {/* More Info */}
                {airportInfo.wikipedia_link && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaExternalLinkAlt />
                    </div>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>More Info</span>
                      <span className={styles.infoValue}>
                        <a
                          href={airportInfo.wikipedia_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Wikipedia{" "}
                          <FaExternalLinkAlt className={styles.linkIcon} />
                        </a>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Info Section */}
            <div className={styles.section}>
              <h5 className={styles.sectionTitle}>
                <WiDaySunny className={styles.sectionIcon} />
                Weather Conditions
              </h5>
              {loading && (
                <div className={styles.loading}>
                  <Spinner animation="border" size="sm" /> Loading weather...
                </div>
              )}
              {!loading && weather ? (
                <div className={styles.weatherGrid}>
                  <div className={styles.weatherMain}>
                    <img
                      src={weather.descriptionIcon}
                      alt={weather.description}
                      className={styles.weatherIcon}
                    />
                    <div>
                      <span className={styles.temp}>{weather.temperature}</span>
                      <p className={styles.desc}>{weather.description}</p>
                    </div>
                  </div>
                  <div className={styles.weatherDetails}>
                    <div className={styles.weatherItem}>
                      <WiHumidity className={styles.weatherIconSmall} />
                      <span>{weather.humidity}</span>
                    </div>
                    <div className={styles.weatherItem}>
                      <WiBarometer className={styles.weatherIconSmall} />
                      <span>{weather.pressure}</span>
                    </div>
                    <div className={styles.weatherItem}>
                      <WiStrongWind className={styles.weatherIconSmall} />
                      <span>
                        {weather.windSpeed} ({weather.windDirection})
                      </span>
                    </div>
                    <div className={styles.weatherItem}>
                      <FaEye className={styles.weatherIconSmall} />
                      <span>{weather.visibility}</span>
                    </div>
                    <div className={styles.weatherItem}>
                      <WiSunrise className={styles.weatherIconSmall} />
                      <span>{weather.sunRise}</span>
                    </div>
                    <div className={styles.weatherItem}>
                      <WiSunset className={styles.weatherIconSmall} />
                      <span>{weather.sunSet}</span>
                    </div>
                  </div>
                </div>
              ) : (
                !loading && (
                  <p className={styles.noData}>Weather data not available</p>
                )
              )}
            </div>

            {/* Distance Comparison Section */}
            <div className={`${styles.section} ${styles.distanceSection}`}>
              <h5 className={styles.sectionTitle}>
                <MdLocationPin className={styles.sectionIcon} />
                Distance from Current Location
              </h5>
              {distance != null ? (
                <div className={styles.distanceContent}>
                  <p className={styles.distanceValue}>
                    You are {distance} km (air distance) from this airport
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${airportInfo.latitude_deg},${airportInfo.longitude_deg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.navigationLink}
                  >
                    Navigate to Airport{" "}
                    <FaExternalLinkAlt className={styles.linkIcon} />
                  </a>
                </div>
              ) : (
                <p className={styles.distance}>Distance not available</p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>No airport selected</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AirportModal;
