"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapViewProps = {
  resizeToken?: number;
};

function AutoResizeMap({ resizeToken = 0 }: { resizeToken: number }) {
	const map = useMap();

	useEffect(() => {
		const timeout = setTimeout(() => {
			map.invalidateSize();
		}, 50);

		return () => {
			clearTimeout(timeout);
		};
	}, [map, resizeToken]);

	return null;
}

const MapView: React.FC<MapViewProps> = ({ resizeToken = 0 }) => {
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
			<AutoResizeMap resizeToken={resizeToken} />
		</MapContainer>
	);
};

export default MapView;
