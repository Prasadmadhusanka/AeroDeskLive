import { useState } from "react";
import { Modal, Table } from "react-bootstrap";
import styles from "../../styles/component_styles/modals/DepartureListViewModal.module.css";

const DepartureListViewModal = ({ show, onHide, data }) => {
  const [sortField, setSortField] = useState("scheduledTime");
  const [sortDirection, setSortDirection] = useState("asc");

  // Process data for the table
  const processedData = data.map((flight, index) => ({
    id: index,
    from: `${flight.departureAirportName} (${flight.departureAirportIataCode})`,
    fromCountry: flight.departureAirportCountry,
    fromCountryCode: flight.departureAirportCountryCode,
    to: `${flight.arrivalAirportName} (${flight.arrivalAirportIataCode})`,
    toCountry: flight.arrivalAirportCountry,
    toCountryCode: flight.arrivalAirportCountryCode,
    flightIataNumber: flight.flightIataNumber,
    scheduledTime: flight.departureScheduledTime,
    departureDelay: flight.departureDelay,
    airlineIataCode: flight.airlineIataCode,
    flightStatus: flight.flightStatus,
    departureTerminal: flight.departureTerminal,
    departureGate: flight.departureGate,
    flightDuration: flight.flightDuration,
    airline: flight.airlineName,
  }));

  // Sort data based on selected field and direction
  const sortedData = [...processedData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle time sorting
    if (sortField === "scheduledTime") {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format arrival delay
  const formatDelay = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `+${hours}h ${mins}m`;
    if (hours > 0) return `+${hours}h`;
    return `+${mins}m`;
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return styles.statusScheduled;
      case "active":
        return styles.statusActive;
      case "landed":
        return styles.statusLanded;
      case "cancelled":
        return styles.statusCancelled;
      case "incident":
        return styles.statusIncident;
      case "diverted":
        return styles.statusDiverted;
      default:
        return styles.statusUnknown;
    }
  };

  const SortIcon = ({ field }) => (
    <span className={styles.sortIcon}>
      {sortField === field && (sortDirection === "asc" ? "↑" : "↓")}
    </span>
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className={styles.modal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <div>
            Departures
            <span className={styles.flightsCount}>
              {data.length} {data.length === 1 ? "flight" : "flights"}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {data && data.length > 0 ? (
          <div className={styles.tableContainer}>
            <Table responsive hover className={styles.arrivalTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th
                    className={`${styles.columnHeader} ${styles.columnTime} ${
                      sortField === "scheduledTime" ? styles.sortActive : ""
                    }`}
                    onClick={() => handleSort("scheduledTime")}
                  >
                    Sch. Time <SortIcon field="scheduledTime" />
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnFlight} ${
                      sortField === "flightIataNumber" ? styles.sortActive : ""
                    }`}
                    onClick={() => handleSort("flightIataNumber")}
                  >
                    Flight No. <SortIcon field="flightIataNumber" />
                  </th>
                  <th
                    className={`${styles.columnHeader} ${
                      styles.columnAirline
                    } ${sortField === "airline" ? styles.sortActive : ""}`}
                    onClick={() => handleSort("airline")}
                  >
                    Airline <SortIcon field="airline" />
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnOrigin} ${
                      sortField === "to" ? styles.sortActive : ""
                    }`}
                    onClick={() => handleSort("to")}
                  >
                    Destination Airport <SortIcon field="to" />
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnDuration}`}
                  >
                    Flight Duration
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnTerminal}`}
                  >
                    Terminal
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnTerminal}`}
                  >
                    Gate
                  </th>
                  <th
                    className={`${styles.columnHeader} ${styles.columnStatus} ${
                      sortField === "flightStatus" ? styles.sortActive : ""
                    }`}
                    onClick={() => handleSort("flightStatus")}
                  >
                    Status <SortIcon field="flightStatus" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((flight) => (
                  <tr key={flight.id} className={styles.tableRow}>
                    <td className={styles.cellTime}>
                      <div className={styles.timeContainer}>
                        <span className={styles.scheduledTime}>
                          {formatTime(flight.scheduledTime)}
                        </span>
                        {flight.departureDelay > 0 && (
                          <span className={styles.delayIndicator}>
                            {formatDelay(flight.departureDelay)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.cellFlight}>
                      <div className={styles.flightInfo}>
                        <span className={styles.flightNumber}>
                          {flight.flightIataNumber || "--"}
                        </span>
                      </div>
                    </td>
                    <td className={styles.cellAirline}>
                      <div className={styles.airlineInfo}>
                        <img
                          src={`https://img.wway.io/pics/root/${flight.airlineIataCode}@png?exar=1&rs=fit:200:200`}
                          alt={`${flight.airline} logo`}
                          className={styles.airlineLogo}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <span className={styles.airlineName}>
                          {flight.airline === "empty" ? "--" : flight.airline}
                        </span>
                      </div>
                    </td>
                    <td className={styles.cellOrigin}>
                      <div className={styles.originInfo}>
                        <div className={styles.originDetails}>
                          <div className={styles.airportCodeRow}>
                            <span className={styles.airportCode}>
                              {flight.to.split("(")[1].replace(")", "")}
                            </span>
                          </div>
                          <span className={styles.airportName}>
                            {flight.to.split("(")[0]}
                          </span>
                          <span className={styles.countryName}>
                            {flight.toCountry}
                            {flight.toCountryCode && (
                              <img
                                src={`https://flagsapi.com/${flight.toCountryCode}/shiny/24.png`}
                                alt={`${flight.toCountry} flag`}
                                className={styles.countryFlag}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.cellDuration}>
                      {Math.round(flight.flightDuration / 60)}h{" "}
                      {flight.flightDuration % 60}m
                    </td>
                    <td className={styles.cellTerminal}>
                      {flight.departureTerminal || "--"}
                    </td>
                    <td className={styles.cellTerminal}>
                      {flight.departureGate || "--"}
                    </td>
                    <td className={styles.cellStatus}>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(
                          flight.flightStatus
                        )}`}
                      >
                        {flight.flightStatus?.toLowerCase() === "active"
                          ? "Departed"
                          : flight.flightStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>No flight data available</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default DepartureListViewModal;
