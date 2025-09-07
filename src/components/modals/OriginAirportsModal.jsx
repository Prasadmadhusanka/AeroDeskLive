import { useState } from "react";
import { Modal, Accordion } from "react-bootstrap";
import styles from "../../styles/component_styles/modals/OriginAirportsModal.module.css";

const OriginAirportsModal = ({ show, onHide, data }) => {
  const [activeKey, setActiveKey] = useState(null);

  // Build mapping airport -> flights
  const airportsData = data.reduce((acc, flight) => {
    if (!flight.departureAirportIataCode || !flight.departureAirportName)
      return acc;

    const airportCode = flight.departureAirportIataCode;
    const airportName = flight.departureAirportName;
    const country = flight.departureAirportCountry;
    const countryCode = flight.departureAirportCountryCode;
    const region = flight.departureAirportRegion;

    if (!acc[airportCode]) {
      acc[airportCode] = {
        name: airportName,
        country: country,
        code: countryCode,
        count: 0,
        region: region,
        flights: [],
      };
    }

    acc[airportCode].count++;
    acc[airportCode].flights.push({
      from: `${flight.departureAirportName} (${flight.departureAirportIataCode})`,
      to: `${flight.arrivalAirportName} (${flight.arrivalAirportIataCode})`,
      airline: flight.airlineName,
      scheduledTime: flight.arrivalScheduledTime,
      arrivalDelay: flight.arrivalDelay,
      airlineIataCode: flight.airlineIataCode,
      flightIataNumber: flight.flightIataNumber,
      flightStatus: flight.flightStatus,
      arrivalTerminal: flight.arrivalTerminal,
      flightDuration: flight.flightDuration,
    });

    return acc;
  }, {});

  // Convert to array and sort by flight count (descending)
  const airports = Object.entries(airportsData)
    .map(([code, info]) => ({
      code,
      name: info.name,
      country: info.country,
      countryCode: info.code,
      count: info.count,
      region: info.region,
      flights: info.flights,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Count unique countries
  const uniqueCountries = new Set(
    data
      .filter((f) => f.departureAirportCountry)
      .map((f) => f.departureAirportCountry)
  );

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format flight duration
  const formatDuration = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format arrival delay
  const formatDelay = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `+${hours}h ${mins}m delay`;
    if (hours > 0) return `+${hours}h delay`;
    return `+${mins}m delay`;
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

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className={styles.modal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <div>
            Origin Airports
            <span className={styles.airportsCount}>
              {airports.length} airports across {uniqueCountries.size}{" "}
              {uniqueCountries.size === 1 ? "country" : "countries"}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {data && data.length > 0 ? (
          <div className={styles.airportsList}>
            <Accordion activeKey={activeKey} onSelect={setActiveKey}>
              {airports.map((airport, idx) => (
                <Accordion.Item
                  key={idx}
                  eventKey={idx.toString()}
                  className={styles.airportAccordionItem}
                >
                  <Accordion.Header className={styles.accordionHeader}>
                    <div className={styles.airportHeader}>
                      {airport.countryCode && (
                        <>
                          <img
                            src={`https://flagsapi.com/${airport.countryCode}/shiny/64.png`}
                            alt={`${airport.country} flag`}
                            className={styles.countryFlag}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                          <div className={styles.countryFallback}>
                            {airport.countryCode}
                          </div>
                        </>
                      )}
                      <div className={styles.airportDetails}>
                        <span className={styles.airportName}>
                          {airport.name} ({airport.code})
                        </span>
                        <span className={styles.airportCountry}>
                          {airport.region}, {airport.country}
                        </span>
                      </div>
                      <span className={styles.flightCount}>
                        {airport.count}{" "}
                        {airport.count === 1 ? "flight" : "flights"}
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className={styles.accordionBody}>
                    <div className={styles.flightsList}>
                      {airport.flights.map((f, fIdx) => (
                        <div key={fIdx} className={styles.flightItem}>
                          <div className={styles.flightMain}>
                            <div className={styles.flightRoute}>
                              <div className={styles.routeSegment}>
                                <span className={styles.airportCode}>
                                  {f.from.split("(")[1].replace(")", "")}
                                </span>
                                <span className={styles.routeAirportName}>
                                  {f.from.split("(")[0]}
                                </span>
                              </div>
                              <div className={styles.routeConnector}>
                                <div className={styles.flightDuration}>
                                  {formatDuration(f.flightDuration)}
                                </div>
                                <div className={styles.connectionLine}>
                                  <span className={styles.airlineCode}>
                                    {f.airlineIataCode}
                                  </span>
                                  <span className={styles.flightNumber}>
                                    {f.flightIataNumber}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.routeSegment}>
                                <span className={styles.airportCode}>
                                  {f.to.split("(")[1].replace(")", "")}
                                </span>
                                <span className={styles.routeAirportName}>
                                  {f.to.split("(")[0]}
                                </span>
                              </div>
                            </div>

                            <div className={styles.flightDetails}>
                              <div className={styles.detailGroup}>
                                <span className={styles.detailLabel}>
                                  Arrival
                                </span>
                                <span className={styles.detailValue}>
                                  {formatTime(f.scheduledTime)}
                                </span>
                                {f.arrivalDelay > 0 && (
                                  <span className={styles.delayBadge}>
                                    {formatDelay(f.arrivalDelay)}
                                  </span>
                                )}
                              </div>

                              {f.arrivalTerminal && (
                                <div className={styles.detailGroup}>
                                  <span className={styles.detailLabel}>
                                    Terminal
                                  </span>
                                  <span className={styles.detailValue}>
                                    {f.arrivalTerminal}
                                  </span>
                                </div>
                              )}

                              <div className={styles.detailGroup}>
                                <span className={styles.detailLabel}>
                                  Status
                                </span>
                                <span
                                  className={`${
                                    styles.flightStatus
                                  } ${getStatusClass(f.flightStatus)}`}
                                >
                                  {f.flightStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.flightFooter}>
                            <div className={styles.airlineInfo}>
                              {f.airlineIataCode && (
                                <img
                                  src={`https://img.wway.io/pics/root/${f.airlineIataCode}@png?exar=1&rs=fit:200:200`}
                                  alt={`${f.airline} logo`}
                                  className={styles.airlineLogo}
                                  onError={(e) =>
                                    (e.target.style.display = "none")
                                  }
                                />
                              )}
                              <span className={styles.airlineName}>
                                {f.airline === "empty"
                                  ? "No Airline Data"
                                  : f.airline}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
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

export default OriginAirportsModal;
