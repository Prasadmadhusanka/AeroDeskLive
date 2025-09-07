// components/DepartureList.jsx
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/component_styles/DepartureList.module.css";

// React Icons
import {
  FaGlobe,
  FaPlaneArrival,
  FaListAlt,
  FaClock,
  FaPlane,
} from "react-icons/fa";

// Import modals
import DestinationCountriesModal from "./modals/DestinationCountriesModal";
import DestinationAirportsModal from "./modals/DestinationAirportsModal";
import DepartureAirlinesModal from "./modals/DepartureAirlinesModal";
import DepartureListViewModal from "./modals/DepartureListViewModal";
import DepartureLongestRoutesModal from "./modals/DepartureLongestRoutesModal";
import DepartureShortestRoutesModal from "./modals/DepartureShortestRoutesModal";

const DepartureList = ({ filters, data }) => {
  const [showModal, setShowModal] = useState(null);

  // Helper to format duration in hours & minutes
  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  // Calculate longest and shortest routes (ignore zero-duration flights)
  let longestRoute = "";
  let shortestRoute = "";

  const validFlights = data.filter((f) => f.flightDuration > 0);

  if (validFlights.length > 0) {
    const sortedByDuration = [...validFlights].sort(
      (a, b) => b.flightDuration - a.flightDuration
    );

    const maxFlight = sortedByDuration[0];
    const minFlight = sortedByDuration[sortedByDuration.length - 1];

    longestRoute = (
      <span>
        <img
          src={`https://flagsapi.com/${maxFlight.departureAirportCountryCode}/shiny/24.png`}
          alt={maxFlight.departureAirportCountry}
          style={{ marginRight: "6px", marginBottom: "6px" }}
          onError={(e) => (e.target.style.display = "none")}
        />
        {maxFlight.departureAirportIataCode} -{" "}
        {maxFlight.arrivalAirportIataCode}{" "}
        <img
          src={`https://flagsapi.com/${maxFlight.arrivalAirportCountryCode}/shiny/24.png`}
          alt={maxFlight.arrivalAirportCountry}
          style={{ marginRight: "6px", marginBottom: "6px" }}
          onError={(e) => (e.target.style.display = "none")}
        />
        {formatDuration(maxFlight.flightDuration)}
      </span>
    );

    shortestRoute = (
      <span>
        <img
          src={`https://flagsapi.com/${minFlight.departureAirportCountryCode}/shiny/24.png`}
          alt={minFlight.departureAirportCountry}
          style={{ marginRight: "6px", marginBottom: "6px" }}
          onError={(e) => (e.target.style.display = "none")}
        />
        {minFlight.departureAirportIataCode} -{" "}
        {minFlight.arrivalAirportIataCode}{" "}
        <img
          src={`https://flagsapi.com/${minFlight.arrivalAirportCountryCode}/shiny/24.png`}
          alt={minFlight.arrivalAirportCountry}
          style={{ marginRight: "6px", marginBottom: "6px" }}
          onError={(e) => (e.target.style.display = "none")}
        />
        {formatDuration(minFlight.flightDuration)}
      </span>
    );
  }

  // Derived dashboard data
  const dashboardData = {
    destinationCountries: new Set(
      data.map((f) => f.arrivalAirportCountry).filter(Boolean)
    ).size,
    destinationAirports: new Set(
      data.map((f) => f.arrivalAirportIataCode).filter(Boolean)
    ).size,
    airlines: new Set(data.map((f) => f.airlineIataCode).filter(Boolean)).size,
    listView: data.length,
    longestRoute,
    shortestRoute,
  };

  return (
    <Container fluid className={styles.departureList}>
      <Row className={styles.dashboardRow}>
        {/* First Column */}
        <Col sm={6} className={styles.dashboardCol}>
          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("countries")}
          >
            <FaGlobe className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Destinations - Countries</h3>
            <p className={styles.tileValue}>
              {dashboardData.destinationCountries}
            </p>
          </div>

          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("airports")}
          >
            <FaPlaneArrival className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Destination - Airports</h3>
            <p className={styles.tileValue}>
              {dashboardData.destinationAirports}
            </p>
          </div>

          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("airlines")}
          >
            <FaPlane className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Airlines</h3>
            <p className={styles.tileValue}>{dashboardData.airlines}</p>
          </div>
        </Col>

        {/* Second Column */}
        <Col sm={6} className={styles.dashboardCol}>
          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("listview")}
          >
            <FaListAlt className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Departure List</h3>
            <p className={styles.tileValue}>{dashboardData.listView}</p>
          </div>

          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("longest")}
          >
            <FaClock className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Longest Routes</h3>
            <p className={styles.tileValue}>{dashboardData.longestRoute}</p>
          </div>

          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("shortest")}
          >
            <FaClock className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Shortest Routes</h3>
            <p className={styles.tileValue}>{dashboardData.shortestRoute}</p>
          </div>
        </Col>
      </Row>

      {/* Modals */}
      <DestinationCountriesModal
        show={showModal === "countries"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <DestinationAirportsModal
        show={showModal === "airports"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <DepartureAirlinesModal
        show={showModal === "airlines"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <DepartureListViewModal
        show={showModal === "listview"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <DepartureLongestRoutesModal
        show={showModal === "longest"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <DepartureShortestRoutesModal
        show={showModal === "shortest"}
        onHide={() => setShowModal(null)}
        data={data}
      />
    </Container>
  );
};

export default DepartureList;
