// components/ArrivalMap.jsx
import { useEffect, useRef } from "react";
import styles from "../styles/component_styles/ArrivalMap.module.css";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import Overlay from "ol/Overlay";
import Control from "ol/control/Control";
import { splitAtIDL } from "../utils/splitAtIDL";

const ArrivalMap = ({ data, airportInfo }) => {
  const mapRef = useRef();
  const popupRef = useRef();
  const mapInstance = useRef(null);
  const vectorSource = useRef(new VectorSource());
  const vectorLayer = useRef(null);
  const popupOverlay = useRef(null);

  // Create custom zoom-to-airport control
  const createZoomToAirportControl = (map, airportInfo) => {
    const button = document.createElement("button");
    button.innerHTML = "⤾";
    button.title = "Zoom to Airport";

    button.addEventListener("click", () => {
      if (
        airportInfo &&
        airportInfo.longitude_deg &&
        airportInfo.latitude_deg
      ) {
        const center = fromLonLat([
          airportInfo.longitude_deg,
          airportInfo.latitude_deg,
        ]);
        map.getView().animate({ center, zoom: 2, rotation: 0 });
      }
    });

    const element = document.createElement("div");
    element.className = styles.controls;
    element.appendChild(button);

    return new Control({ element });
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      popupOverlay.current = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -10],
      });

      vectorLayer.current = new VectorLayer({ source: vectorSource.current });

      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM() }), vectorLayer.current],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
          enableRotation: false,
        }),
        controls: defaultControls({ zoom: false, rotate: false }),
        overlays: [popupOverlay.current],
      });

      // Add custom zoom-to-airport control
      if (airportInfo) {
        mapInstance.current.addControl(
          createZoomToAirportControl(mapInstance.current, airportInfo)
        );
      }

      // Popup and hover behavior
      mapInstance.current.on("pointermove", (evt) => {
        const feature = mapInstance.current.forEachFeatureAtPixel(
          evt.pixel,
          (feature) => feature
        );

        if (feature) {
          const properties = feature.getProperties();
          const coordinate = evt.coordinate;

          if (properties.popupContent) {
            popupRef.current.innerHTML = properties.popupContent;
            popupOverlay.current.setPosition(coordinate);
            popupRef.current.style.display = "block";
          }
        } else {
          popupRef.current.style.display = "none";
        }

        const pixel = mapInstance.current.getEventPixel(evt.originalEvent);
        const hit = mapInstance.current.hasFeatureAtPixel(pixel);
        mapInstance.current.getTargetElement().style.cursor = hit
          ? "pointer"
          : "";
      });

      return () => {
        if (mapInstance.current) {
          mapInstance.current.setTarget(undefined);
          mapInstance.current = null;
        }
      };
    }
  }, [airportInfo]);

  // Center map on airport when airportInfo changes
  useEffect(() => {
    if (!airportInfo || !airportInfo.longitude_deg || !airportInfo.latitude_deg)
      return;

    const center = fromLonLat([
      airportInfo.longitude_deg,
      airportInfo.latitude_deg,
    ]);

    if (mapInstance.current) {
      mapInstance.current.getView().setCenter(center);
      mapInstance.current.getView().setZoom(2);
    }
  }, [airportInfo]);

  // Render airport + flight data
  useEffect(() => {
    vectorSource.current.clear();
    popupRef.current.style.display = "none";

    // Always show the airport marker if airportInfo exists
    if (airportInfo && airportInfo.longitude_deg && airportInfo.latitude_deg) {
      let arrivalColor;
      switch (airportInfo.type) {
        case "large_airport":
          arrivalColor = "red";
          break;
        case "medium_airport":
          arrivalColor = "orange";
          break;
        case "small_airport":
          arrivalColor = "green";
          break;
        default:
          arrivalColor = "#4D4D4D";
      }

      const arrivalPoint = fromLonLat([
        airportInfo.longitude_deg,
        airportInfo.latitude_deg,
      ]);

      const arrivalFeature = new Feature({ geometry: new Point(arrivalPoint) });

      arrivalFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: arrivalColor }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        })
      );

      arrivalFeature.setProperties({
        popupContent: `
    <div class="${styles.popupContent}">
      <strong>${airportInfo.name} (${airportInfo.iata_code})</strong><br/>
      ${airportInfo.region_name}, ${airportInfo.country_name}
      <img
        src="https://flagsapi.com/${airportInfo.iso_country}/shiny/16.png"
        alt="Flag of ${airportInfo.iso_country}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
    </div>
  `,
      });

      vectorSource.current.addFeature(arrivalFeature);
    }

    // Only draw routes if `data` exists
    if (!data || data.length === 0) return;

    data.forEach((flight) => {
      const {
        departureAirportLongitude,
        departureAirportLatitude,
        intersectionIDL,
      } = flight;

      if (!departureAirportLongitude || !departureAirportLatitude) return;

      const depPoint = fromLonLat([
        departureAirportLongitude,
        departureAirportLatitude,
      ]);

      let pointColor;
      switch (flight.departureAirportType) {
        case "large_airport":
          pointColor = "red";
          break;
        case "medium_airport":
          pointColor = "orange";
          break;
        case "small_airport":
          pointColor = "green";
          break;
        default:
          pointColor = "#4D4D4D";
      }

      const depFeature = new Feature({ geometry: new Point(depPoint) });

      depFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: pointColor }),
            stroke: new Stroke({ color: "white", width: 1.5 }),
          }),
        })
      );

      depFeature.setProperties({
        popupContent: `
    <div class="${styles.popupContent}">
      <strong>${flight.departureAirportName} (${flight.departureAirportIataCode})</strong><br/>
      ${flight.departureAirportRegion}, ${flight.departureAirportCountry}
      <img
        src="https://flagsapi.com/${flight.departureAirportCountryCode}/shiny/16.png"
        alt="Flag of ${flight.departureAirportCountryCode}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
    </div>
  `,
      });

      vectorSource.current.addFeature(depFeature);

      // Flight line
      if (intersectionIDL === "yes") {
        const { line1, line2 } = splitAtIDL(
          [departureAirportLongitude, departureAirportLatitude],
          [airportInfo.longitude_deg, airportInfo.latitude_deg]
        );

        [line1, line2].forEach((segment) => {
          const coords = segment.map((coord) => fromLonLat(coord));
          const feature = new Feature({ geometry: new LineString(coords) });

          feature.setStyle(
            new Style({ stroke: new Stroke({ color: "red", width: 1 }) })
          );

          feature.setProperties({
            popupContent: `
    <div class="${styles.popupContent}">
      <img
        src="https://flagsapi.com/${
          flight.departureAirportCountryCode
        }/shiny/16.png"
        alt="Flag of ${flight.departureAirportCountryCode}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
      <strong>${flight.departureAirportIataCode}</strong>
      &rarr;
      <strong>${flight.arrivalAirportIataCode}</strong>
      <img
        src="https://flagsapi.com/${airportInfo.iso_country}/shiny/16.png"
        alt="Flag of ${airportInfo.iso_country}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
      <br/>
            Flight Duration: ${Math.floor(flight.flightDuration / 60)}h ${
              flight.flightDuration % 60
            }m
    </div>
  `,
          });

          vectorSource.current.addFeature(feature);
        });
      } else {
        const lineFeature = new Feature({
          geometry: new LineString([
            depPoint,
            fromLonLat([airportInfo.longitude_deg, airportInfo.latitude_deg]),
          ]),
        });

        lineFeature.setStyle(
          new Style({ stroke: new Stroke({ color: "red", width: 1 }) })
        );

        lineFeature.setProperties({
          popupContent: `
    <div class="${styles.popupContent}">
      <img
        src="https://flagsapi.com/${
          flight.departureAirportCountryCode
        }/shiny/16.png"
        alt="Flag of ${flight.departureAirportCountryCode}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
      <strong>${flight.departureAirportIataCode}</strong>
      &rarr;
      <strong>${flight.arrivalAirportIataCode}</strong>
      <img
        src="https://flagsapi.com/${airportInfo.iso_country}/shiny/16.png"
        alt="Flag of ${airportInfo.iso_country}"
        class="${styles.flag}"
        onerror="this.style.display='none';"
      />
      <br/>
            Flight Duration: ${Math.floor(flight.flightDuration / 60)}h ${
            flight.flightDuration % 60
          }m
    </div>
  `,
        });

        vectorSource.current.addFeature(lineFeature);
      }
    });
  }, [data, airportInfo]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
      <div ref={popupRef} className={styles.popup}></div>
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
    </div>
  );
};

export default ArrivalMap;
