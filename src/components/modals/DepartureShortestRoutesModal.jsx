import { useEffect, useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import styles from "../../styles/component_styles/modals/DepartureShortestRoutesModal.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DepartureShortestRoutesModal = ({ show, onHide, data }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [selectedFlights, setSelectedFlights] = useState([]);

  useEffect(() => {
    if (!show) setSelectedFlights([]);
  }, [show]);

  // ---- NEW: compute unique route count (depIATA-arrIATA) ----
  const uniqueRoutesCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const keys = new Set();
    data.forEach((f) => {
      if (f.flightDuration > 0) {
        keys.add(`${f.departureAirportIataCode}-${f.arrivalAirportIataCode}`);
      }
    });
    return keys.size;
  }, [data]);

  const displayedRoutesCount = Math.min(uniqueRoutesCount, 15);
  // -----------------------------------------------------------

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDelay = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `+${hours}h ${mins}m delay`;
    if (hours > 0) return `+${hours}h delay`;
    return `+${mins}m delay`;
  };

  const getBarColor = (duration) => {
    if (duration < 60) return "rgba(34, 197, 94, 0.9)";
    if (duration < 120) return "rgba(134, 239, 172, 0.9)";
    if (duration < 180) return "rgba(253, 224, 71, 0.9)";
    return "rgba(249, 115, 22, 0.9)";
  };

  // ✅ FIX: unique routes
  useEffect(() => {
    if (!data || data.length === 0) return;

    // group by route
    const routeMap = {};
    data.forEach((f) => {
      if (f.flightDuration > 0) {
        const routeKey = `${f.departureAirportIataCode}-${f.arrivalAirportIataCode}`;
        if (!routeMap[routeKey]) routeMap[routeKey] = [];
        routeMap[routeKey].push(f);
      }
    });

    // prepare unique route data
    const uniqueRoutes = Object.entries(routeMap)
      .map(([routeKey, flights]) => {
        const shortest = flights.reduce((min, f) =>
          f.flightDuration < min.flightDuration ? f : min
        );
        return { routeKey, flights, shortest };
      })
      .sort((a, b) => a.shortest.flightDuration - b.shortest.flightDuration)
      .slice(0, 15);

    if (uniqueRoutes.length === 0) return;

    const labels = uniqueRoutes.map(
      (r) =>
        `${r.shortest.departureAirportIataCode} → ${r.shortest.arrivalAirportIataCode}`
    );
    const durations = uniqueRoutes.map((r) => r.shortest.flightDuration);
    const backgroundColors = uniqueRoutes.map((r) =>
      getBarColor(r.shortest.flightDuration)
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Flight Duration (minutes)",
          data: durations,
          backgroundColor: backgroundColors,
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: "rgba(79, 70, 229, 0.9)",
        },
      ],
    });

    setChartOptions({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context) => {
              const r = uniqueRoutes[context[0].dataIndex];
              return `${r.shortest.departureAirportName} (${r.shortest.departureAirportIataCode}) → ${r.shortest.arrivalAirportName} (${r.shortest.arrivalAirportIataCode})`;
            },
            label: (ctx) => {
              const r = uniqueRoutes[ctx.dataIndex];
              return `Shortest Duration: ${formatDuration(
                r.shortest.flightDuration
              )}`;
            },
            afterLabel: (ctx) => {
              const r = uniqueRoutes[ctx.dataIndex];
              return `Flights available: ${r.flights.length}`;
            },
          },
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#111",
          bodyColor: "#333",
          borderColor: "#ccc",
          borderWidth: 1,
          displayColors: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Flight Duration (minutes)",
            color: "rgb(108, 117, 125)",
            font: { size: 12, weight: "bold" },
          },
          grid: { color: "#e0e0e0" },
          ticks: { color: "var(--grey-text)" },
        },
        y: {
          title: {
            display: true,
            text: "Route",
            color: "rgb(108, 117, 125)",
            font: { size: 12, weight: "bold" },
          },
          grid: { color: "#e0e0e0" },
          ticks: { color: "var(--grey-text)" },
        },
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const clickedRoute = uniqueRoutes[elements[0].index];
          setSelectedFlights(clickedRoute.flights);
        }
      },
    });
  }, [data]);

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
            Shortest Flight Routes
            <span className={styles.routesCount}>
              Top {displayedRoutesCount}{" "}
              {displayedRoutesCount === 1 ? "route" : "routes"} by shortest
              duration
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {data && data.length > 0 ? (
          <div className={styles.contentContainer}>
            {chartData && chartOptions ? (
              <>
                <div className={styles.chartContainer}>
                  <Bar data={chartData} options={chartOptions} />
                </div>

                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendBox}
                      style={{ background: "rgba(34, 197, 94, 0.9)" }}
                    ></span>{" "}
                    Very short-haul (0-1hr)
                  </span>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendBox}
                      style={{ background: "rgba(134, 239, 172, 0.9)" }}
                    ></span>{" "}
                    Short-haul (1-2hrs)
                  </span>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendBox}
                      style={{ background: "rgba(253, 224, 71, 0.9)" }}
                    ></span>{" "}
                    Medium short-haul (2-3hrs)
                  </span>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendBox}
                      style={{ background: "rgba(249, 115, 22, 0.9)" }}
                    ></span>{" "}
                    Medium-haul (3-6hrs)
                  </span>
                </div>

                {selectedFlights.length > 0 ? (
                  selectedFlights.map((flight, idx) => (
                    <div key={idx} className={styles.flightDetails}>
                      {/* ✅ reused the existing flight details block */}
                      <div className={styles.flightMain}>
                        <div className={styles.flightRoute}>
                          <div className={styles.routeSegment}>
                            <span className={styles.airportCode}>
                              {flight.departureAirportIataCode}
                            </span>
                            <span className={styles.airportName}>
                              {flight.departureAirportName}
                            </span>
                            <span className={styles.countryName}>
                              {flight.departureAirportCountry}
                            </span>
                            {flight.departureAirportCountryCode && (
                              <img
                                src={`https://flagsapi.com/${flight.departureAirportCountryCode}/shiny/24.png`}
                                alt=""
                                className={styles.flag}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            )}
                          </div>

                          <div className={styles.routeConnector}>
                            <div className={styles.flightDuration}>
                              {formatDuration(flight.flightDuration)}
                            </div>
                            <div className={styles.connectionLine}>
                              <span className={styles.airlineCode}>
                                {flight.airlineIataCode}
                              </span>
                              <span className={styles.flightNumber}>
                                {flight.flightIataNumber}
                              </span>
                            </div>
                          </div>

                          <div className={styles.routeSegment}>
                            <span className={styles.airportCode}>
                              {flight.arrivalAirportIataCode}
                            </span>
                            <span className={styles.airportName}>
                              {flight.arrivalAirportName}
                            </span>
                            <span className={styles.countryName}>
                              {flight.arrivalAirportCountry}
                            </span>
                            {flight.arrivalAirportCountryCode && (
                              <img
                                src={`https://flagsapi.com/${flight.arrivalAirportCountryCode}/shiny/24.png`}
                                alt=""
                                className={styles.flag}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            )}
                          </div>
                        </div>

                        <div className={styles.flightDetailsSection}>
                          <div className={styles.detailGroup}>
                            <span className={styles.detailLabel}>
                              Scheduled Departure
                            </span>
                            <span className={styles.detailValue}>
                              {formatTime(flight.departureScheduledTime)}
                            </span>
                            {flight.departureDelay > 0 && (
                              <span className={styles.delayBadge}>
                                {formatDelay(flight.departureDelay)}
                              </span>
                            )}
                          </div>

                          {flight.departureTerminal && (
                            <div className={styles.detailGroup}>
                              <span className={styles.detailLabel}>
                                Terminal
                              </span>
                              <span className={styles.detailValue}>
                                {flight.departureTerminal}
                              </span>
                            </div>
                          )}

                          {flight.departureGate && (
                            <div className={styles.detailGroup}>
                              <span className={styles.detailLabel}>Gate</span>
                              <span className={styles.detailValue}>
                                {flight.departureGate}
                              </span>
                            </div>
                          )}

                          <div className={styles.detailGroup}>
                            <span className={styles.detailLabel}>Status</span>
                            <div className={styles.statusSection}>
                              <span
                                className={`${
                                  styles.flightStatus
                                } ${getStatusClass(flight.flightStatus)}`}
                              >
                                {flight.flightStatus?.toLowerCase() === "active"
                                  ? "Departed"
                                  : flight.flightStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.flightFooter}>
                        <div className={styles.airlineInfo}>
                          {flight.airlineIataCode && (
                            <img
                              src={`https://img.wway.io/pics/root/${flight.airlineIataCode}@png?exar=1&rs=fit:200:200`}
                              alt={flight.airlineName}
                              className={styles.airlineLogo}
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                          <span className={styles.airlineName}>
                            {flight.airlineName &&
                            flight.airlineName.trim().toLowerCase() !== "empty"
                              ? flight.airlineName
                              : "No Airline Data"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.instructions}>
                    <p>Click on a bar to view flight details</p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noData}>
                <p>No flight data available</p>
              </div>
            )}
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

export default DepartureShortestRoutesModal;
