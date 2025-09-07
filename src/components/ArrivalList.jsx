// components/ArrivalList.jsx
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/component_styles/ArrivalList.module.css";

// React Icons
import {
  FaGlobe,
  FaPlaneDeparture,
  FaListAlt,
  FaClock,
  FaPlane,
} from "react-icons/fa";

// Import modals
import OriginCountriesModal from "./modals/OriginCountriesModal";
import OriginAirportsModal from "./modals/OriginAirportsModal";
import ArrivalAirlinesModal from "./modals/ArrivalAirlinesModal";
import ArrivalListViewModal from "./modals/ArrivalListViewModal";
import ArrivalLongestRoutesModal from "./modals/ArrivalLongestRoutesModal";
import ArrivalShortestRoutesModal from "./modals/ArrivalShortestRoutesModal";

const ArrivalList = ({ filters, data }) => {
  const [showModal, setShowModal] = useState(null);

  // Helper to format duration
  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  // Filter out zero-duration flights
  const validFlights = data.filter((f) => f.flightDuration > 0);

  // Calculate longest and shortest routes
  let longestRoute = "";
  let shortestRoute = "";

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
    originCountries: new Set(
      data.map((f) => f.departureAirportCountry).filter(Boolean)
    ).size,
    originAirports: new Set(
      data.map((f) => f.departureAirportIataCode).filter(Boolean)
    ).size,
    airlines: new Set(data.map((f) => f.airlineIataCode).filter(Boolean)).size,
    listView: data.length,
    longestRoute,
    shortestRoute,
  };

  return (
    <Container fluid className={styles.arrivalList}>
      <Row className={styles.dashboardRow}>
        {/* First Column */}
        <Col sm={6} className={styles.dashboardCol}>
          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("countries")}
          >
            <FaGlobe className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Origin - Countries</h3>
            <p className={styles.tileValue}>{dashboardData.originCountries}</p>
          </div>

          <div
            className={styles.dashboardTile}
            onClick={() => setShowModal("airports")}
          >
            <FaPlaneDeparture className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Origin - Airports</h3>
            <p className={styles.tileValue}>{dashboardData.originAirports}</p>
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
            <h3 className={styles.tileTitle}>Arrival List</h3>
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
      <OriginCountriesModal
        show={showModal === "countries"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <OriginAirportsModal
        show={showModal === "airports"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <ArrivalAirlinesModal
        show={showModal === "airlines"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <ArrivalListViewModal
        show={showModal === "listview"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <ArrivalLongestRoutesModal
        show={showModal === "longest"}
        onHide={() => setShowModal(null)}
        data={data}
      />
      <ArrivalShortestRoutesModal
        show={showModal === "shortest"}
        onHide={() => setShowModal(null)}
        data={data}
      />
    </Container>
  );
};

export default ArrivalList;
