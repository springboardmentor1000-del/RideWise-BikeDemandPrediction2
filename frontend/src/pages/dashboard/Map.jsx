import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/dashboard.css";

/* ================= CITY ICON ================= */

const cityIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [32, 32],
});

/* ================= DEMAND HELPERS ================= */

const getRandomDemand = () => {
  const levels = ["Low", "Moderate", "High"];
  return levels[Math.floor(Math.random() * levels.length)];
};

const demandColor = (level) => {
  if (level === "High") return "#ef4444";      // red
  if (level === "Moderate") return "#f59e0b";  // orange
  return "#22c55e";                            // green
};

/* ================= CITY + AREA DATA ================= */

const cityData = [
  {
    name: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    areas: [
      { name: "Andheri", lat: 19.1136, lng: 72.8697 },
      { name: "Malabar Hills", lat: 18.9547, lng: 72.7987 },
      { name: "Bandra", lat: 19.0596, lng: 72.8295 },
      { name: "Dadar", lat: 19.0176, lng: 72.8562 },
      { name: "Borivali", lat: 19.2307, lng: 72.8567 },
    ],
  },
  {
    name: "Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    areas: [
      { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
      { name: "Whitefield", lat: 12.9698, lng: 77.7499 },
      { name: "Yelahanka", lat: 13.1007, lng: 77.5963 },
      { name: "BTM", lat: 12.9166, lng: 77.6101 },
      { name: "MG Road", lat: 12.9747, lng: 77.6130 },
    ],
  },
  {
    name: "Hyderabad",
    lat: 17.385,
    lng: 78.4867,
    areas: [
      { name: "Hitech City", lat: 17.4474, lng: 78.3762 },
      { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
      { name: "Kukatpally", lat: 17.4948, lng: 78.3996 },
      { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
    ],
  },
  {
    name: "Delhi",
    lat: 28.6139,
    lng: 77.2090,
    areas: [
      { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
      { name: "Dwarka", lat: 28.5921, lng: 77.0460 },
      { name: "Saket", lat: 28.5245, lng: 77.2066 },
      { name: "Rohini", lat: 28.7499, lng: 77.0565 },
    ],
  },
];

/* ================= MAP PAGE ================= */

export default function MapPage() {
  const [areaDemand, setAreaDemand] = useState({});

  /* Generate random demand once */
  useEffect(() => {
    const generated = {};
    cityData.forEach(city => {
      city.areas.forEach(area => {
        generated[area.name] = getRandomDemand();
      });
    });
    setAreaDemand(generated);
  }, []);

  return (
    <div className="page map-page">
      <h2 className="page-title">Bike Demand Map – India</h2>

      {/* ================= LEGEND ================= */}
      <div className="map-legend">
        <span><span className="dot green" /> Low</span>
        <span><span className="dot orange" /> Moderate</span>
        <span><span className="dot red" /> High</span>
      </div>

      {/* ================= MAP ================= */}
      <MapContainer
        center={[22.97, 78.65]}
        zoom={5}
        style={{ height: "480px", borderRadius: "14px" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* City Markers */}
        {cityData.map(city => (
          <Marker
            key={city.name}
            position={[city.lat, city.lng]}
            icon={cityIcon}
          >
            <Popup>
              <strong>{city.name}</strong>
              <br />
              City Hub
            </Popup>
          </Marker>
        ))}

        {/* Area Demand Circles */}
        {cityData.map(city =>
          city.areas.map(area => {
            const level = areaDemand[area.name];
            return (
              <CircleMarker
                key={area.name}
                center={[area.lat, area.lng]}
                radius={10}
                fillColor={demandColor(level)}
                fillOpacity={0.75}
                stroke={false}
              >
                <Popup>
                  <strong>{area.name}</strong>
                  <br />
                  Demand: <b>{level}</b>
                </Popup>
              </CircleMarker>
            );
          })
        )}
      </MapContainer>
    </div>
  );
}
