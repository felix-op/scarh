export type EstadisticaAtributo = "altura_agua" | "presion" | "temperatura";

export type EstadisticaPostRequest = {
    limnigrafos: number[],
    atributo: EstadisticaAtributo,
    fecha_inicio: string,
    fecha_fin: string,
};

export type EstadisticaResponse = {
    id: number | null,
    maximo: number,
    minimo: number,
    atributo: EstadisticaAtributo,
    moda: number | null,
    desvio_estandar: number,
    percentil_90: number,
};
