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

const FilterModal = ({ show, onHide, airports = [], onApplyFilters }) => {
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

  const initialView = useRef({ center: fromLonLat([0, 0]), zoom: 2 });

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

  const continentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(airports.map((a) => a.continent).filter(Boolean))
    ).sort();
    return [defaultSelect, ...unique.map((c) => ({ value: c, label: c }))];
  }, [airports]);

  const countryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(airports.map((a) => a.country_name_new).filter(Boolean))
    ).sort();
    return [defaultSelect, ...unique.map((c) => ({ value: c, label: c }))];
  }, [airports]);

  const airportNameOptions = useMemo(() => {
    const unique = Array.from(
      new Set(airports.map((a) => a.name).filter(Boolean))
    ).sort();
    return [defaultSelect, ...unique.map((n) => ({ value: n, label: n }))];
  }, [airports]);

  const airportCodeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(airports.map((a) => a.iata_code).filter(Boolean))
    ).sort();
    return [defaultSelect, ...unique.map((c) => ({ value: c, label: c }))];
  }, [airports]);

  // Initialize map & popup
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

  // Update map size and markers when modal is fully shown
  useEffect(() => {
    if (!show || !mapInstanceRef.current || !isMapInitialized) return;

    const updateMap = () => {
      try {
        mapInstanceRef.current.updateSize();
        updateMarkers();
        if (filteredAirports.length > 0) {
          fitMarkers(filteredAirports);
        }
      } catch (error) {
        console.error("Error updating map:", error);
      }
    };

    // Delay to ensure modal animation completes
    const timer = setTimeout(updateMap, 100);
    return () => clearTimeout(timer);
  }, [show, isMapInitialized, filteredAirports]);

  const updateMarkers = () => {
    if (!vectorLayerRef.current || !mapInstanceRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    vectorSource.clear();

    filteredAirports.forEach((a) => {
      if (a.latitude_deg && a.longitude_deg) {
        const feature = new Feature({
          geometry: new Point(fromLonLat([a.longitude_deg, a.latitude_deg])),
        });

        const isSelected = selectedAirport?.iata_code === a.iata_code;

        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isSelected ? 10 : 6,
              fill: new Fill({ color: airportTypeColor[a.type] || "blue" }),
              stroke: new Stroke({
                color: "#fff",
                width: isSelected ? 2 : 1,
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

  // Popup + click handling
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;

    const handlePointerMove = (evt) => {
      const feature = mapInstanceRef.current.forEachFeatureAtPixel(
        evt.pixel,
        (f) => f
      );

      if (feature && feature.get("popupContent") && popupRef.current) {
        popupRef.current.innerHTML = feature.get("popupContent");
        popupOverlayRef.current.setPosition(evt.coordinate);
        popupRef.current.style.display = "block";
      } else if (popupRef.current) {
        popupRef.current.style.display = "none";
      }
    };

    const handleMapClick = (evt) => {
      const feature = mapInstanceRef.current.forEachFeatureAtPixel(
        evt.pixel,
        (f) => f
      );

      if (feature && feature.get("airportData")) {
        const airport = feature.get("airportData");
        setSelectedAirport(airport);
        setSelectedContinent({
          value: airport.continent,
          label: airport.continent,
        });
        setSelectedCountry({
          value: airport.country_name_new,
          label: airport.country_name_new,
        });
        setSelectedAirportName({ value: airport.name, label: airport.name });
        setSelectedAirportCode({
          value: airport.iata_code,
          label: airport.iata_code,
        });
      }
    };

    const map = mapInstanceRef.current;
    map.on("pointermove", handlePointerMove);
    map.on("click", handleMapClick);

    return () => {
      if (map) {
        map.un("pointermove", handlePointerMove);
        map.un("click", handleMapClick);
      }
    };
  }, [isMapInitialized, filteredAirports]);

  useEffect(() => {
    if (!isMapInitialized) return;
    updateMarkers();
    if (filteredAirports.length > 0) {
      fitMarkers(filteredAirports);
    }
  }, [filteredAirports, selectedAirport, isMapInitialized]);

  // Clear selectedAirport if Name or Code reset to "All"
  useEffect(() => {
    if (
      selectedAirport &&
      selectedAirportName.value === "All" &&
      selectedAirportCode.value === "All"
    ) {
      setSelectedAirport(null);
    }
  }, [selectedAirportName, selectedAirportCode, selectedAirport]);

  // Auto-select airport from dropdown and zoom
  useEffect(() => {
    if (!isMapInitialized) return;

    let airport = null;

    if (selectedAirportCode.value !== "All") {
      airport = airports.find((a) => a.iata_code === selectedAirportCode.value);
    } else if (selectedAirportName.value !== "All") {
      airport = airports.find((a) => a.name === selectedAirportName.value);
    }

    if (airport) {
      setSelectedAirport(airport);

      // Zoom to selected airport
      if (
        airport.latitude_deg &&
        airport.longitude_deg &&
        mapInstanceRef.current
      ) {
        const coords = fromLonLat([
          airport.longitude_deg,
          airport.latitude_deg,
        ]);
        mapInstanceRef.current.getView().animate({
          center: coords,
          zoom: 8,
          duration: 500,
        });
      }
    }
  }, [selectedAirportName, selectedAirportCode, airports, isMapInitialized]);

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
                onChange={setSelectedContinent}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownCol}>
              <Form.Label>Country</Form.Label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={setSelectedCountry}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownCol}>
              <Form.Label>Airport Name</Form.Label>
              <Select
                options={airportNameOptions}
                value={selectedAirportName}
                onChange={setSelectedAirportName}
              />
            </Col>
            <Col lg={3} md={6} xs={12} className={styles.dropdownColWithButton}>
              <div className={styles.dropdownWithButton}>
                <Form.Label>Airport Code</Form.Label>
                <Select
                  options={airportCodeOptions}
                  value={selectedAirportCode}
                  onChange={setSelectedAirportCode}
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
          disabled={!selectedAirport}
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

export default FilterModal;
