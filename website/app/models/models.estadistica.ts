export type AtributoEnum = "altura_agua" | "presion" | "temperatura";

export type EstadisticaInput = {
  limnigrafos?: number[];
  atributo?: AtributoEnum;
  fecha_inicio?: string;
  fecha_fin?: string;
};

export type EstadisticaResponse = EstadisticaInput[];
