import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define the component props
interface CountryMapProps {
  mapColor?: string;
}

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill: string;
    borderWidth: number;
    borderColor: string;
    stroke?: string;
    strokeOpacity?: number;
  };
};

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const markers = [
    {
      latLng: [37.2580397, -104.657039] as [number, number],
      name: "United States",
      style: {
        fill: mapColor,
        borderWidth: 1,
        borderColor: "white",
        stroke: "#383f47",
      },
    },
    {
      latLng: [20.7504374, 73.7276105] as [number, number],
      name: "India",
      style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
    },
    {
      latLng: [53.613, -11.6368] as [number, number],
      name: "United Kingdom",
      style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
    },
    {
      latLng: [-25.0304388, 115.2092761] as [number, number],
      name: "Sweden",
      style: {
        fill: "#465FFF",
        borderWidth: 1,
        borderColor: "white",
        strokeOpacity: 0,
      },
    },
  ];

  return (
    <MapContainer
      center={[20, 0]} // Center of the map (LatLngExpression)
      zoom={2} // Initial zoom level
      style={{ height: "500px", width: "100%" }} // Map size
      zoomControl={false} // Disable zoom controls
      scrollWheelZoom={false} // Disable zoom on scroll
    >
      {/* Render the base map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Render markers */}
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.latLng}>
          <Popup>
            <div
              style={{
                fontFamily: "Outfit",
                fontSize: "13px",
                fontWeight: 500,
                color: "#35373e",
              }}
            >
              {marker.name}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CountryMap;