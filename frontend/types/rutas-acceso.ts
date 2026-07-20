export type GeoJsonLineString = {
	type: "LineString";
	coordinates: number[][];
};

export type GeoJsonMultiLineString = {
	type: "MultiLineString";
	coordinates: number[][][];
};

export type RutaAccesoFeatureCollection = {
	type: "FeatureCollection";
	features: Array<{
		type: "Feature";
		properties: {
			start_coordinate?: number[];
			end_coordinate?: number[];
			destination_coordinate?: number[];
			is_round_trip?: boolean;
		} & Record<string, unknown>;
		geometry: GeoJsonLineString | GeoJsonMultiLineString;
	}>;
};

export type FormatoRutaAcceso = "gpx" | "kml";

export type RutaAccesoResponse = {
	id: number;
	limnigrafo: number | null;
	nombre: string;
	formato_origen: FormatoRutaAcceso;
	tiempo_estimado_minutos: number | null;
	distancia_km: number | null;
	observaciones: string;
	archivo_nombre: string | null;
	archivo_url: string | null;
	geometria: RutaAccesoFeatureCollection | null;
	creado_en: string;
	actualizado_en: string;
};
