import { useRef, useEffect, useMemo, useState } from "react";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";
import { FiTrash2 } from "react-icons/fi";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import styles from "../styles/component_styles/FilterModal.module.css";

const airportTypeColor = {
  large_airport: "red",
  medium_airport: "orange",
  small_airport: "green",
};

const FilterModal2 = ({ show, onHide, airports = [], onApplyFilters }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const popupRef = useRef(null);
  const popupOverlayRef = useRef(null);

  const defaultSelect = { value: "All", label: "All" };
  const [selectedContinent, setSelectedContinent] = useState(defaultSelect);
  const [selectedCountry, setSelectedCountry] = useState(defaultSelect);
  const [selectedAirportName, setSelectedAirportName] = useState(defaultSelect);
  const [selectedAirportCode, setSelectedAirportCode] = useState(defaultSelect);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initialView = useRef({ center: fromLonLat([0, 0]), zoom: 1 });

  // Filtering logic
  const filteredAirports = useMemo(() => {
    return airports.filter((a) => {
      const matchContinent =
        selectedContinent.value === "All" ||
        a.continent === selectedContinent.value;
      const matchCountry =
        selectedCountry.value === "All" ||
        a.country_name_new === selectedCountry.value;
      const matchName =
        selectedAirportName.value === "All" ||
        a.name === selectedAirportName.value;
      const matchCode =
        selectedAirportCode.value === "All" ||
        a.iata_code === selectedAirportCode.value;
      return matchContinent && matchCountry && matchName && matchCode;
    });
  }, [
    airports,
    selectedContinent,
    selectedCountry,
    selectedAirportName,
    selectedAirportCode,
  ]);

  // helper: sort alphabetically but keep "All" on top
  const sortOptions = (options) => {
    if (!options.length) return options;
    const [allOption, ...rest] = options;
    return [
      allOption,
      ...rest.sort((a, b) =>
        a.label.localeCompare(b.label, "en", { sensitivity: "base" })
      ),
    ];
  };

  // Dropdown Options (dependent + sorted)
  const continentOptions = useMemo(() => {
    let base = airports;
    if (selectedCountry.value !== "All") {
      base = base.filter((a) => a.country_name_new === selectedCountry.value);
    }
    if (selectedAirportName.value !== "All") {
      base = base.filter((a) => a.name === selectedAirportName.value);
    }
    if (selectedAirportCode.value !== "All") {
      base = base.filter((a) => a.iata_code === selectedAirportCode.value);
    }
    const unique = Array.from(new Set(base.map((a) => a.continent))).filter(
      Boolean
    );
    return sortOptions([
      defaultSelect,
      ...unique.map((c) => ({ value: c, label: c })),
    ]);
  }, [airports, selectedCountry, selectedAirportName, selectedAirportCode]);

  const countryOptions = useMemo(() => {
    let base = airports;
    if (selectedContinent.value !== "All") {
      base = base.filter((a) => a.continent === selectedContinent.value);
    }
    if (selectedAirportName.value !== "All") {
      base = base.filter((a) => a.name === selectedAirportName.value);
    }
    if (selectedAirportCode.value !== "All") {
      base = base.filter((a) => a.iata_code === selectedAirportCode.value);
    }

    // Get unique countries with their iso_country codes using object
    const countryObject = {};
    base.forEach((a) => {
      if (a.country_name_new && a.iso_country) {
        countryObject[a.country_name_new] = a.iso_country;
      }
    });

    const uniqueCountries = Object.entries(countryObject);

    return sortOptions([
      defaultSelect,
      ...uniqueCountries.map(([countryName, isoCode]) => ({
        value: countryName,
        label: countryName,
        isoCode: isoCode,
      })),
    ]);
  }, [airports, selectedContinent, selectedAirportName, selectedAirportCode]);

  const airportNameOptions = useMemo(() => {
    let base = airports;
    if (selectedContinent.value !== "All") {
      base = base.filter((a) => a.continent === selectedContinent.value);
    }
    if (selectedCountry.value !== "All") {
      base = base.filter((a) => a.country_name_new === selectedCountry.value);
    }
    if (selectedAirportCode.value !== "All") {
      base = base.filter((a) => a.iata_code === selectedAirportCode.value);
    }

    // Get unique airports with their country codes
    const airportObject = {};
    base.forEach((a) => {
      if (a.name && a.iso_country) {
        airportObject[a.name] = a.iso_country;
      }
    });

    const uniqueAirports = Object.entries(airportObject);

    return sortOptions([
      defaultSelect,
      ...uniqueAirports.map(([airportName, isoCode]) => ({
        value: airportName,
        label: airportName,
        isoCode: isoCode,
      })),
    ]);
  }, [airports, selectedContinent, selectedCountry, selectedAirportCode]);

  const airportCodeOptions = useMemo(() => {
    let base = airports;
    if (selectedContinent.value !== "All") {
      base = base.filter((a) => a.continent === selectedContinent.value);
    }
    if (selectedCountry.value !== "All") {
      base = base.filter((a) => a.country_name_new === selectedCountry.value);
    }
    if (selectedAirportName.value !== "All") {
      base = base.filter((a) => a.name === selectedAirportName.value);
    }

    // Get unique airport codes with their country codes
    const airportObject = {};
    base.forEach((a) => {
      if (a.iata_code && a.iso_country) {
        airportObject[a.iata_code] = a.iso_country;
      }
    });

    const uniqueAirports = Object.entries(airportObject);

    return sortOptions([
      defaultSelect,
      ...uniqueAirports.map(([airportCode, isoCode]) => ({
        value: airportCode,
        label: airportCode,
        isoCode: isoCode,
      })),
    ]);
  }, [airports, selectedContinent, selectedCountry, selectedAirportName]);

  // Keep dropdowns in sync based on selection
  useEffect(() => {
    if (selectedAirport) {
      setSelectedContinent({
        value: selectedAirport.continent,
        label: selectedAirport.continent,
      });
      setSelectedCountry({
        value: selectedAirport.country_name_new,
        label: selectedAirport.country_name_new,
      });
      setSelectedAirportName({
        value: selectedAirport.name,
        label: selectedAirport.name,
      });
      setSelectedAirportCode({
        value: selectedAirport.iata_code,
        label: selectedAirport.iata_code,
      });
    }
  }, [selectedAirport]);

  // Initialize map
  useEffect(() => {
    if (!show || !mapRef.current) return;

    const initializeMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(mapRef.current);
        return;
      }

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({ source: vectorSource });
      vectorLayerRef.current = vectorLayer;

      const popupElement = document.createElement("div");
      popupElement.className = styles.popup;
      popupElement.style.display = "none";
      if (mapRef.current) {
        mapRef.current.appendChild(popupElement);
      }
      popupRef.current = popupElement;

      const popupOverlay = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -15],
      });
      popupOverlayRef.current = popupOverlay;

      const baseMap = new Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM() }), vectorLayer],
        view: new View({
          center: initialView.current.center,
          zoom: initialView.current.zoom,
        }),
        overlays: [popupOverlay],
      });

      mapInstanceRef.current = baseMap;
      setIsMapInitialized(true);
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
      }
    };
  }, [show]);

  // Update markers
  const updateMarkers = () => {
    if (!vectorLayerRef.current || !mapInstanceRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    vectorSource.clear();

    filteredAirports.forEach((a) => {
      if (a.latitude_deg && a.longitude_deg) {
        const feature = new Feature({
          geometry: new Point(fromLonLat([a.longitude_deg, a.latitude_deg])),
        });

        const isSelected =
          selectedAirportName.value !== "All" ||
          selectedAirportCode.value !== "All";

        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isSelected ? 10 : 6, // larger when selected
              fill: new Fill({ color: airportTypeColor[a.type] || "blue" }),
              stroke: new Stroke({
                color: "#fff",
                width: isSelected ? 3 : 1,
              }),
            }),
          })
        );

        feature.setProperties({
          popupContent: `
        <div class="${styles.popupContent}">
          <strong>${a.name} (${a.iata_code})</strong><br/>
          ${a.region_name}, ${a.country_name}
          <img
            src="https://flagsapi.com/${a.iso_country}/shiny/16.png"
            alt="Flag of ${a.iso_country}"
            class="${styles.flag}"
            onerror="this.style.display='none';"
          />
        </div>
      `,
          airportData: a,
        });

        vectorSource.addFeature(feature);
      }
    });
  };

  // Map interactions: hover popup + click selection
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;

    const map = mapInstanceRef.current;

    const handleMapClick = (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature && feature.get("airportData")) {
        const airport = feature.get("airportData");
        setSelectedAirport(airport);
      }
    };

    const handlePointerMove = (evt) => {
      if (evt.dragging) return;
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature && feature.get("popupContent")) {
        popupRef.current.innerHTML = feature.get("popupContent");
        popupOverlayRef.current.setPosition(
          feature.getGeometry().getCoordinates()
        );
        popupRef.current.style.display = "block";
      } else {
        popupRef.current.style.display = "none";
      }
    };

    map.on("click", handleMapClick);
    map.on("pointermove", handlePointerMove);

    return () => {
      map.un("click", handleMapClick);
      map.un("pointermove", handlePointerMove);
    };
  }, [isMapInitialized, filteredAirports]);

  useEffect(() => {
    if (!isMapInitialized) return;
    updateMarkers();
    if (filteredAirports.length > 0) {
      fitMarkers(filteredAirports);
    }
  }, [filteredAirports, selectedAirport, isMapInitialized]);

  const fitMarkers = (airportsList) => {
    if (!airportsList.length || !mapInstanceRef.current) return;

    const coords = airportsList
      .filter((a) => a.latitude_deg && a.longitude_deg)
      .map((a) => fromLonLat([a.longitude_deg, a.latitude_deg]));

    if (!coords.length) return;

    let minX = coords[0][0],
      minY = coords[0][1],
      maxX = coords[0][0],
      maxY = coords[0][1];

    coords.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });

    const extent = [minX, minY, maxX, maxY];
    mapInstanceRef.current
      .getView()
      .fit(extent, { padding: [50, 50, 50, 50], duration: 500, maxZoom: 8 });
  };

  const clearFilters = () => {
    setSelectedContinent(defaultSelect);
    setSelectedCountry(defaultSelect);
    setSelectedAirportName(defaultSelect);
    setSelectedAirportCode(defaultSelect);
    setSelectedAirport(null);

    if (mapInstanceRef.current && isMapInitialized) {
      fitMarkers(airports);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
      if (popupRef.current && popupRef.current.parentNode) {
        popupRef.current.parentNode.removeChild(popupRef.current);
      }
    };
  }, []);

  // Apply button enable/disable logic
  const isApplyEnabled =
    !!selectedAirport ||
    selectedAirportName.value !== "All" ||
    selectedAirportCode.value !== "All";

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      className={styles.modal}
      onEntered={() => {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.updateSize();
          }
        }, 50);
      }}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>Airport Filters</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Container fluid>
          <Row className={styles.dropdownRow}>
            <Col lg={3} md={6} xs={12} className={styles.dropdownCol}>
              <Form.Label>Continent</Form.Label>
              <Select
                options={continentOptions}
                value={selectedContinent}
                onChange={(val) => setSelectedContinent(val)}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownCol}>
              <Form.Label>Country</Form.Label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(val) => setSelectedCountry(val)}
                formatOptionLabel={(option) => (
                  <div className={styles.countryOption}>
                    {option.value !== "All" && option.isoCode && (
                      <>
                        <img
                          src={`https://flagsapi.com/${option.isoCode}/shiny/16.png`}
                          alt={`Flag of ${option.isoCode}`}
                          className={styles.countryFlag}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div className={styles.countryFallback}>
                          {option.isoCode}
                        </div>
                      </>
                    )}
                    <span>{option.label}</span>
                  </div>
                )}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownCol}>
              <Form.Label>Airport Name</Form.Label>
              <Select
                options={airportNameOptions}
                value={selectedAirportName}
                onChange={(val) => {
                  setSelectedAirportName(val);
                  if (val.value !== "All") {
                    const airport = airports.find((a) => a.name === val.value);
                    setSelectedAirport(airport || null);
                  } else {
                    setSelectedAirport(null);
                  }
                }}
                formatOptionLabel={(option) => (
                  <div className={styles.countryOption}>
                    {option.value !== "All" && option.isoCode && (
                      <>
                        <img
                          src={`https://flagsapi.com/${option.isoCode}/shiny/16.png`}
                          alt={`Flag of ${option.isoCode}`}
                          className={styles.countryFlag}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div className={styles.countryFallback}>
                          {option.isoCode}
                        </div>
                      </>
                    )}
                    <span>{option.label}</span>
                  </div>
                )}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownColWithButton}>
              <div className={styles.dropdownWithButton}>
                <Form.Label>Airport Code</Form.Label>
                <Select
                  options={airportCodeOptions}
                  value={selectedAirportCode}
                  onChange={(val) => {
                    setSelectedAirportCode(val);
                    if (val.value !== "All") {
                      const airport = airports.find(
                        (a) => a.iata_code === val.value
                      );
                      setSelectedAirport(airport || null);
                    } else {
                      setSelectedAirport(null);
                    }
                  }}
                  formatOptionLabel={(option) => (
                    <div className={styles.countryOption}>
                      {option.value !== "All" && option.isoCode && (
                        <>
                          <img
                            src={`https://flagsapi.com/${option.isoCode}/shiny/16.png`}
                            alt={`Flag of ${option.isoCode}`}
                            className={styles.countryFlag}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                          <div className={styles.countryFallback}>
                            {option.isoCode}
                          </div>
                        </>
                      )}
                      <span>{option.label}</span>
                    </div>
                  )}
                />
              </div>
              <Button
                className={styles.clearButton}
                onClick={clearFilters}
                title="Clear filters"
              >
                <FiTrash2 />
              </Button>
            </Col>
          </Row>

          <Row className={styles.mapRow}>
            <Col xs={12} className={styles.mapColumn}>
              <div ref={mapRef} className={styles.mapContainer}></div>
              <div className={styles.legend}>
                <div>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: "red" }}
                  ></span>
                  Large Airport
                </div>
                <div>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: "orange" }}
                  ></span>
                  Medium Airport
                </div>
                <div>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: "green" }}
                  ></span>
                  Small Airport
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button
          className={styles.applyButton}
          disabled={!isApplyEnabled}
          onClick={() => {
            onApplyFilters?.({ airport: selectedAirport });
            onHide();
          }}
        >
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal2;
