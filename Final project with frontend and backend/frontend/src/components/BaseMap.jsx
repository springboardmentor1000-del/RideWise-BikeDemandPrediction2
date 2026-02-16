import { MapContainer, TileLayer } from "react-leaflet";

export default function BaseMap({ center, zoom, children }) {
  return (
        <div className="w-full h-full rounded-2xl overflow-hidden">

          <MapContainer
            center={center}
            zoom={zoom}
            className="w-full h-full"
          >
            {/* ✅ REALISTIC GOOGLE-LIKE MAP */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {children}
          </MapContainer>
      </div>
  );
}
