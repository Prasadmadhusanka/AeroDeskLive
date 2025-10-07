import { useState, useEffect } from "react";
import styles from "../styles/component_styles/MainWindow.module.css";
import DepartureMap from "./DepartureMap";
import ArrivalMap from "./ArrivalMap";
import ArrivalList from "./ArrivalList";
import DepartureList from "./DepartureList";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { MdFlightTakeoff, MdFlightLand } from "react-icons/md";
import GridLoader from "react-spinners/GridLoader";
import { Container, Row, Col } from "react-bootstrap";
import FilterModal from "./FilterModal";
import AirportModal from "./AirportModal";
import { getDeviceLocation } from "../utils/currentLocation";
import { fetchNearestAirport } from "../utils/nearestAirport";
import { fetchAirportArrivals } from "../utils/airportArrivals";
import { fetchAirportDepartures } from "../utils/airportDepartures";
import { fetchWorldAirports } from "../utils/worldAirportData";
import { getLocationTimeInfo } from "../utils/timeDetailsOfLocation";
import { formatAirportArrivals } from "../utils/formattedAirportArrivals";
import { formatAirportDepartures } from "../utils/formattedAirportDepartures";

const MainWindow = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAirportModal, setShowAirportModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [worldAirports, setWorldAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [airportInfo, setAirportInfo] = useState(null);

  const [currentGPS, setCurrentGPS] = useState(null);
  const [locationTimeDetails, setLocationTimeDetails] = useState(null);

  const [arrivalFormattedData, setArrivalFormattedData] = useState([]);
  const [departureFormattedData, setDepartureFormattedData] = useState([]);

  // New state for dropdown filters
  const [arrivalStatusFilter, setArrivalStatusFilter] = useState("All");
  const [departureStatusFilter, setDepartureStatusFilter] = useState("All");
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coords = await getDeviceLocation();
        setCurrentGPS(coords);

        // Fetch all world airports
        const allAirports = await fetchWorldAirports();
        setWorldAirports(allAirports);

        // Use selected airport if available, otherwise fetch nearest airport
        let airport = selectedAirport;
        if (!airport) {
          airport = await fetchNearestAirport(coords.lat, coords.lng);
        }

        if (airport) {
          setAirportInfo(airport);

          const deviceTime = new Date().toISOString();

          const location_time_details = getLocationTimeInfo(
            coords.lat,
            coords.lng,
            airport.latitude_deg,
            airport.longitude_deg,
            deviceTime
          );
          setLocationTimeDetails(location_time_details);

          const arrivals = await fetchAirportArrivals(airport.iata_code);
          const formattedArrivals = formatAirportArrivals(
            arrivals,
            location_time_details.fullTime
          );
          setArrivalFormattedData(formattedArrivals);

          const departures = await fetchAirportDepartures(airport.iata_code);
          const formattedDepartures = formatAirportDepartures(
            departures,
            location_time_details.fullTime
          );
          setDepartureFormattedData(formattedDepartures);
        } else {
          setError("No airport found nearby");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAirport]);

  const refreshFlightData = async () => {
    if (!airportInfo || !locationTimeDetails) return;

    try {
      setLoading(true);

      // Reset dropdown filters to "All" whenever refresh is clicked
      setArrivalStatusFilter("All");
      setDepartureStatusFilter("All");

      const arrivals = await fetchAirportArrivals(airportInfo.iata_code);
      const formattedArrivals = formatAirportArrivals(
        arrivals,
        locationTimeDetails.fullTime
      );
      setArrivalFormattedData(formattedArrivals);

      const departures = await fetchAirportDepartures(airportInfo.iata_code);
      const formattedDepartures = formatAirportDepartures(
        departures,
        locationTimeDetails.fullTime
      );
      setDepartureFormattedData(formattedDepartures);
    } catch (err) {
      console.error("Error refreshing flight data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Set the selected airport when filters are applied
    if (newFilters.airport) {
      setSelectedAirport(newFilters.airport);
    }
  };

  // Get unique arrival statuses sorted by status code
  const arrivalStatusOptions = [
    "All",
    ...Array.from(
      new Map(
        arrivalFormattedData
          .filter(
            (item) =>
              item.arrivalTimeStatus && item.arrivalTimeStatusCode !== undefined
          )
          .map((item) => [item.arrivalTimeStatus, item.arrivalTimeStatusCode])
      ).entries()
    )
      .sort((a, b) => a[1] - b[1]) // sort ascending by code
      .map(([status]) => status),
  ];

  const departureStatusOptions = [
    "All",
    ...Array.from(
      new Map(
        departureFormattedData
          .filter(
            (item) =>
              item.departureTimeStatus &&
              item.departureTimeStatusCode !== undefined
          )
          .map((item) => [
            item.departureTimeStatus,
            item.departureTimeStatusCode,
          ])
      ).entries()
    )
      .sort((a, b) => a[1] - b[1]) // ascending by code
      .map(([status]) => status),
  ];

  // 🔹 Filtered arrivals
  const filteredArrivals =
    arrivalStatusFilter === "All"
      ? arrivalFormattedData
      : arrivalFormattedData.filter(
          (item) => item.arrivalTimeStatus === arrivalStatusFilter
        );

  // 🔹 Filtered departures
  const filteredDepartures =
    departureStatusFilter === "All"
      ? departureFormattedData
      : departureFormattedData.filter(
          (item) => item.departureTimeStatus === departureStatusFilter
        );

  return (
    <div className={styles.mainWindow}>
      {loading && (
        <div className={styles.fullScreenLoader}>
          <GridLoader color="#7c3aed" size={15} />
          <p className={styles.loadingText}>Loading airport information...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className={styles.header}>
            <button
              className={styles.filterButton}
              onClick={() => setShowFilterModal(true)}
              aria-label="Show filters"
            >
              <FiFilter className={styles.filterIcon} />
            </button>
            <h1
              className={styles.title}
              onClick={() => setShowAirportModal(true)}
              style={{ cursor: "pointer" }}
            >
              {loading ? (
                <span>Loading airport information...</span>
              ) : error ? (
                <span>Error: {error}</span>
              ) : airportInfo ? (
                <div className={styles.titleContent}>
                  <div className={styles.titleText}>
                    <span
                      className={styles.airportName}
                    >{`${airportInfo.name} (${airportInfo.iata_code})`}</span>
                    <div className={styles.countryRow}>
                      <span className={styles.countryName}>
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
                              e.target.nextElementSibling.style.display =
                                "flex";
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
              ) : (
                <span>No airport information available</span>
              )}
            </h1>
            <button
              className={styles.refreshButton}
              aria-label="Refresh airport data"
              onClick={refreshFlightData}
            >
              <FiRefreshCw className={styles.refreshIcon} />
            </button>
          </div>

          <Container fluid className={styles.container}>
            <Row className={styles.row1}>
              {/* Left Column - Arrival Sections */}
              <Col lg={6} className={styles.leftColumn}>
                <Row className={styles.arrivalMapRow}>
                  <Col>
                    <div className={styles.sectionHeader}>
                      <h4>
                        <MdFlightLand style={{ marginRight: "8px" }} /> Arrivals
                      </h4>
                      <div className={styles.dropdownContainer}>
                        <button
                          className={styles.dropdownToggle}
                          onClick={() =>
                            setShowArrivalDropdown(!showArrivalDropdown)
                          }
                        >
                          {arrivalStatusFilter}
                          <span className={styles.dropdownArrow}>▼</span>
                        </button>
                        {showArrivalDropdown && (
                          <div className={styles.dropdownMenu}>
                            {arrivalStatusOptions.map((status) => (
                              <div
                                key={status}
                                className={`${styles.dropdownItem} ${
                                  arrivalStatusFilter === status
                                    ? styles.active
                                    : ""
                                }`}
                                onClick={() => {
                                  setArrivalStatusFilter(status);
                                  setShowArrivalDropdown(false);
                                }}
                              >
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.mapContainer}>
                      <ArrivalMap
                        data={filteredArrivals}
                        airportInfo={airportInfo}
                        statusFilter={arrivalStatusFilter}
                      />
                    </div>
                  </Col>
                </Row>
                <Row className={styles.arrivalListRow}>
                  <Col>
                    <div className={styles.listContainer}>
                      <ArrivalList
                        filters={filters}
                        data={filteredArrivals}
                        statusFilter={arrivalStatusFilter}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>

              {/* Right Column - Departure Sections */}
              <Col lg={6} className={styles.rightColumn}>
                <Row className={styles.departureMapRow}>
                  <Col>
                    <div className={styles.sectionHeader}>
                      <h4>
                        <MdFlightTakeoff style={{ marginRight: "8px" }} />{" "}
                        Departures
                      </h4>
                      <div className={styles.dropdownContainer}>
                        <button
                          className={styles.dropdownToggle}
                          onClick={() =>
                            setShowDepartureDropdown(!showDepartureDropdown)
                          }
                        >
                          {departureStatusFilter}
                          <span className={styles.dropdownArrow}>▼</span>
                        </button>
                        {showDepartureDropdown && (
                          <div className={styles.dropdownMenu}>
                            {departureStatusOptions.map((status) => (
                              <div
                                key={status}
                                className={`${styles.dropdownItem} ${
                                  departureStatusFilter === status
                                    ? styles.active
                                    : ""
                                }`}
                                onClick={() => {
                                  setDepartureStatusFilter(status);
                                  setShowDepartureDropdown(false);
                                }}
                              >
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.mapContainer}>
                      <DepartureMap
                        data={filteredDepartures}
                        airportInfo={airportInfo}
                        statusFilter={departureStatusFilter}
                      />
                    </div>
                  </Col>
                </Row>
                <Row className={styles.departureListRow}>
                  <Col>
                    <div className={styles.listContainer}>
                      <DepartureList
                        filters={filters}
                        data={filteredDepartures}
                        statusFilter={departureStatusFilter}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </>
      )}

      <FilterModal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        airports={worldAirports}
        onApplyFilters={handleApplyFilters}
      />

      <AirportModal
        show={showAirportModal}
        onHide={() => setShowAirportModal(false)}
        airportInfo={airportInfo}
        locationTimeDetails={locationTimeDetails}
        currentGPS={currentGPS}
      />
    </div>
  );
};

export default MainWindow;
