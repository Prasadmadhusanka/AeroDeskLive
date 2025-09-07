import { useState } from "react";
import { Modal, Accordion } from "react-bootstrap";
import styles from "../../styles/component_styles/modals/OriginCountriesModal.module.css";

const OriginCountriesModal = ({ show, onHide, data }) => {
  const [activeKey, setActiveKey] = useState(null);

  // Build mapping continent -> countries -> flights
  const countriesByContinent = data.reduce((acc, flight) => {
    if (!flight.departureAirportCountry || !flight.departureAirportContinent)
      return acc;

    const country = flight.departureAirportCountry;
    const continent = flight.departureAirportContinent;
    const code = flight.departureAirportCountryCode;

    if (!acc[continent]) acc[continent] = {};
    if (!acc[continent][country])
      acc[continent][country] = { count: 0, code, flights: [] };

    acc[continent][country].count++;
    acc[continent][country].flights.push({
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

  const continents = Object.entries(countriesByContinent)
    .map(([continent, countriesObj]) => {
      const countries = Object.entries(countriesObj).map(([name, info]) => ({
        name,
        count: info.count,
        code: info.code,
        flights: info.flights,
      }));

      // Calculate how many countries are in this continent
      const countryCount = countries.length;

      return {
        name: continent,
        countryCount,
        countries: countries.sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name)
        ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const uniqueCountries = new Set(
    data
      .filter((f) => f.departureAirportCountry)
      .map((f) => f.departureAirportCountry)
  );
  const continentCount = continents.length;

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
            Origin Countries
            <span className={styles.countriesCount}>
              {uniqueCountries.size}{" "}
              {uniqueCountries.size === 1 ? "country" : "countries"} across{" "}
              {continentCount}{" "}
              {continentCount === 1 ? "continent" : "continents"}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {data && data.length > 0 ? (
          <div className={styles.continentsList}>
            {continents.map((continent, idx) => (
              <div key={idx} className={styles.continentGroup}>
                <h3 className={styles.continentName}>
                  {continent.name}
                  <span className={styles.continentCount}>
                    {continent.countryCount}{" "}
                    {continent.countryCount === 1 ? "country" : "countries"}
                  </span>
                </h3>
                <Accordion activeKey={activeKey} onSelect={setActiveKey}>
                  {continent.countries.map((country, countryIdx) => (
                    <Accordion.Item
                      key={countryIdx}
                      eventKey={`${idx}-${countryIdx}`}
                      className={styles.countryAccordionItem}
                    >
                      <Accordion.Header className={styles.accordionHeader}>
                        <div className={styles.countryHeader}>
                          {country.code && (
                            <>
                              <img
                                src={`https://flagsapi.com/${country.code}/shiny/64.png`}
                                alt={`${country.name} flag`}
                                className={styles.countryFlag}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling.style.display =
                                    "flex";
                                }}
                              />
                              <div className={styles.countryFallback}>
                                {country.code}
                              </div>
                            </>
                          )}
                          <span className={styles.countryName}>
                            {country.name}
                          </span>
                          <span className={styles.countryCount}>
                            {country.count}{" "}
                            {country.count === 1 ? "flight" : "flights"}
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className={styles.accordionBody}>
                        <div className={styles.flightsList}>
                          {country.flights.map((f, fIdx) => (
                            <div key={fIdx} className={styles.flightItem}>
                              <div className={styles.flightMain}>
                                <div className={styles.flightRoute}>
                                  <div className={styles.routeSegment}>
                                    <span className={styles.airportCode}>
                                      {f.from.split("(")[1].replace(")", "")}
                                    </span>
                                    <span className={styles.airportName}>
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
                                    <span className={styles.airportName}>
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
            ))}
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

export default OriginCountriesModal;
