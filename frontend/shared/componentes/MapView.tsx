"use client";

import { Map, MapTileLayer, MapZoomControl } from "@componentes/components/ui/map";

export type MapViewProps = {
	resizeToken?: number;
};

const DEFAULT_CENTER: [number, number] = [-54.79930469196583, -68.30601485928138];

const MapView: React.FC<MapViewProps> = ({ resizeToken = 0 }) => {
	// Se eliminaron los puntos y la lógica antigua de react-leaflet como solicitaste.
	// Solo queda el contenedor principal con el nuevo mapa.
	return (
		<div className="relative h-full w-full">
			<Map
				center={DEFAULT_CENTER}
				zoom={15}
				className="h-full w-full min-h-[400px]"
			>
				<MapTileLayer 
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
					attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
				/>
				<MapZoomControl />
			</Map>
		</div>
	);
};

export default MapView;
