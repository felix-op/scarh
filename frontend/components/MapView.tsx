"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView: React.FC = () => {
  return (
    <MapContainer
      center={{ lat: -54.79930469196583, lng: -68.30601485928138 }}
      zoom={13}
      className="h-full w-full min-h-[400px]"
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MapView;
