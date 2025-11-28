"use client";

import type { LimnigrafoRowData } from "@/components/LimnigrafoTable";

export type LimnigrafoDetalleData = LimnigrafoRowData & {
  temperatura: string;
  altura: string;
  presion: string;
  ultimoMantenimiento: string;
  descripcion: string;
  datosExtra: { label: string; value: string }[];
};

export const LIMNIGRAFOS: LimnigrafoDetalleData[] = [
  {
    id: "lim-1",
    nombre: "Limnigrafo Chapala",
    ubicacion: "Presa de Chapala",
    bateria: "Bateria 92%",
    tiempoUltimoDato: "Hace 15 minutos",
    estado: { variante: "activo" },
    temperatura: "24°",
    altura: "52 mts",
    presion: "1.2 bar",
    ultimoMantenimiento: "12/05/2024",
    descripcion:
      "Monitorea el nivel principal de la presa de Chapala con acceso sencillo desde el embarcadero norte.",
    datosExtra: [
      { label: "Dato 1", value: "Sensor A-OK" },
      { label: "Dato 2", value: "Flujo estable" },
      { label: "Dato 3", value: "Sin alertas" },
    ],
  },
  {
    id: "lim-2",
    nombre: "Limnigrafo Lago Sur",
    ubicacion: "Lago Sur - Embarcadero",
    bateria: "Bateria 80%",
    tiempoUltimoDato: "Hace 40 minutos",
    estado: { variante: "activo" },
    temperatura: "21°",
    altura: "48 mts",
    presion: "1.1 bar",
    ultimoMantenimiento: "05/04/2024",
    descripcion:
      "Registrando oscilaciones rápidas del lago, ideal para alertas tempranas en temporada de lluvias.",
    datosExtra: [
      { label: "Dato 1", value: "Sensor estable" },
      { label: "Dato 2", value: "Calibrado abril" },
      { label: "Dato 3", value: "Ruta sur" },
    ],
  },
  {
    id: "lim-3",
    nombre: "Limnigrafo Rio Verde",
    ubicacion: "Rio Verde - Puente 3",
    bateria: "Bateria 56%",
    tiempoUltimoDato: "Hace 1 hora",
    estado: { variante: "advertencia" },
    temperatura: "19°",
    altura: "61 mts",
    presion: "1.4 bar",
    ultimoMantenimiento: "17/03/2024",
    descripcion:
      "Ubicado bajo el puente 3, requiere atención por lecturas de crecida recientes.",
    datosExtra: [
      { label: "Dato 1", value: "Crecida leve" },
      { label: "Dato 2", value: "Comunicar brigada" },
      { label: "Dato 3", value: "Revisión semanal" },
    ],
  },
  {
    id: "lim-4",
    nombre: "Limnigrafo Laguna Blanca",
    ubicacion: "Laguna Blanca - Zona Sur",
    bateria: "Bateria 34%",
    tiempoUltimoDato: "Hace 2 horas",
    estado: { variante: "advertencia" },
    temperatura: "18°",
    altura: "40 mts",
    presion: "0.9 bar",
    ultimoMantenimiento: "02/02/2024",
    descripcion:
      "Equipo crítico para la zona sur de Laguna Blanca, requiere reemplazo de batería pronto.",
    datosExtra: [
      { label: "Dato 1", value: "Batería baja" },
      { label: "Dato 2", value: "Ruta 12" },
      { label: "Dato 3", value: "Pendiente panel" },
    ],
  },
  {
    id: "lim-5",
    nombre: "Limnigrafo Delta Norte",
    ubicacion: "Delta del Norte",
    bateria: "Bateria 67%",
    tiempoUltimoDato: "Hace 10 minutos",
    estado: { variante: "activo" },
    temperatura: "23°",
    altura: "57 mts",
    presion: "1.3 bar",
    ultimoMantenimiento: "19/05/2024",
    descripcion:
      "Controla el ingreso del delta con datos de alta frecuencia para decisiones de compuerta.",
    datosExtra: [
      { label: "Dato 1", value: "Compuerta A" },
      { label: "Dato 2", value: "Lectura estable" },
      { label: "Dato 3", value: "Sin anomalías" },
    ],
  },
  {
    id: "lim-6",
    nombre: "Limnigrafo Arroyo Seco",
    ubicacion: "Arroyo Seco - Km 8",
    bateria: "Bateria 15%",
    tiempoUltimoDato: "Hace 3 horas",
    estado: { variante: "fuera" },
    temperatura: "16°",
    altura: "32 mts",
    presion: "0.7 bar",
    ultimoMantenimiento: "26/01/2024",
    descripcion:
      "Sensor actualmente fuera de servicio por falta de batería; requiere visita técnica.",
    datosExtra: [
      { label: "Dato 1", value: "Sin señal" },
      { label: "Dato 2", value: "Batería agotada" },
      { label: "Dato 3", value: "Reemplazar módulo" },
    ],
  },
  {
    id: "lim-7",
    nombre: "Limnigrafo Sierra Azul",
    ubicacion: "Sierra Azul - Estacion 2",
    bateria: "Bateria 88%",
    tiempoUltimoDato: "Hace 5 minutos",
    estado: { variante: "activo" },
    temperatura: "14°",
    altura: "68 mts",
    presion: "1.6 bar",
    ultimoMantenimiento: "14/05/2024",
    descripcion:
      "Equipo en zona de sierra con comunicaciones vía satélite, actualmente estable.",
    datosExtra: [
      { label: "Dato 1", value: "Satélite ok" },
      { label: "Dato 2", value: "Lluvia ligera" },
      { label: "Dato 3", value: "Acceso 4x4" },
    ],
  },
  {
    id: "lim-8",
    nombre: "Limnigrafo Valle Verde",
    ubicacion: "Valle Verde - Tanque Alto",
    bateria: "Bateria 44%",
    tiempoUltimoDato: "Hace 50 minutos",
    estado: { variante: "prueba" },
    temperatura: "20°",
    altura: "55 mts",
    presion: "1.0 bar",
    ultimoMantenimiento: "29/04/2024",
    descripcion:
      "En modo prueba tras actualización de firmware en la estación de tanque alto.",
    datosExtra: [
      { label: "Dato 1", value: "Firmware beta" },
      { label: "Dato 2", value: "Monitoreo QA" },
      { label: "Dato 3", value: "Visita 48h" },
    ],
  },
  {
    id: "lim-9",
    nombre: "Limnigrafo Costa Dorada",
    ubicacion: "Costa Dorada - Faro",
    bateria: "Bateria 72%",
    tiempoUltimoDato: "Hace 25 minutos",
    estado: { variante: "activo" },
    temperatura: "26°",
    altura: "49 mts",
    presion: "1.2 bar",
    ultimoMantenimiento: "08/04/2024",
    descripcion:
      "Resguarda el nivel costero cerca del faro para prevenir inundaciones en el malecón.",
    datosExtra: [
      { label: "Dato 1", value: "Brisa marina" },
      { label: "Dato 2", value: "Ruta costera" },
      { label: "Dato 3", value: "Panel solar limpio" },
    ],
  },
  {
    id: "lim-10",
    nombre: "Limnigrafo Rio Claro",
    ubicacion: "Rio Claro - Paso Viejo",
    bateria: "Bateria 61%",
    tiempoUltimoDato: "Hace 35 minutos",
    estado: { variante: "activo" },
    temperatura: "22°",
    altura: "58 mts",
    presion: "1.3 bar",
    ultimoMantenimiento: "30/03/2024",
    descripcion: "Monitorea el paso viejo para gestionar alertas en puentes bajos.",
    datosExtra: [
      { label: "Dato 1", value: "Cauce limpio" },
      { label: "Dato 2", value: "Mantenimiento mayo" },
      { label: "Dato 3", value: "Ruta 7" },
    ],
  },
  {
    id: "lim-11",
    nombre: "Limnigrafo Cordillera",
    ubicacion: "Cordillera Central - Refugio",
    bateria: "Bateria 48%",
    tiempoUltimoDato: "Hace 1 hora 20 minutos",
    estado: { variante: "advertencia" },
    temperatura: "9°",
    altura: "70 mts",
    presion: "1.7 bar",
    ultimoMantenimiento: "11/03/2024",
    descripcion:
      "Unidad ubicada en refugio de montaña, cuidado con nevadas que afectan las antenas.",
    datosExtra: [
      { label: "Dato 1", value: "Nieve ligera" },
      { label: "Dato 2", value: "Calefacción ok" },
      { label: "Dato 3", value: "Refugio cerrado" },
    ],
  },
  {
    id: "lim-12",
    nombre: "Limnigrafo Estuario Sur",
    ubicacion: "Estuario Sur - Borde Oeste",
    bateria: "Mantenimiento",
    tiempoUltimoDato: "Sin datos recientes",
    estado: { variante: "prueba" },
    temperatura: "25°",
    altura: "45 mts",
    presion: "0.8 bar",
    ultimoMantenimiento: "20/02/2024",
    descripcion:
      "Actualmente en mantenimiento programado para recalibración de sensores de salinidad.",
    datosExtra: [
      { label: "Dato 1", value: "Sin lecturas" },
      { label: "Dato 2", value: "Equipo en taller" },
      { label: "Dato 3", value: "Volver 30 días" },
    ],
  },
  {
    id: "lim-13",
    nombre: "Limnigrafo Puerto Azul",
    ubicacion: "Puerto Azul - Muelles",
    bateria: "Bateria 95%",
    tiempoUltimoDato: "Hace 3 minutos",
    estado: { variante: "activo" },
    temperatura: "27°",
    altura: "47 mts",
    presion: "1.1 bar",
    ultimoMantenimiento: "01/06/2024",
    descripcion:
      "Equipo de respuesta rápida para el puerto azul. Perfecto estado general.",
    datosExtra: [
      { label: "Dato 1", value: "Anclaje firme" },
      { label: "Dato 2", value: "Muelle 2" },
      { label: "Dato 3", value: "Alertas off" },
    ],
  },
  {
    id: "lim-14",
    nombre: "Limnigrafo Dique Norte",
    ubicacion: "Dique Norte - Compuerta 4",
    bateria: "Bateria 12%",
    tiempoUltimoDato: "Hace 4 horas",
    estado: { variante: "fuera" },
    temperatura: "17°",
    altura: "53 mts",
    presion: "1.0 bar",
    ultimoMantenimiento: "09/01/2024",
    descripcion:
      "Detenido por falta de energía en la compuerta 4; requiere asistencia inmediata.",
    datosExtra: [
      { label: "Dato 1", value: "En pausa" },
      { label: "Dato 2", value: "Enviar técnico" },
      { label: "Dato 3", value: "Compuerta cerrada" },
    ],
  },
  {
    id: "lim-15",
    nombre: "Limnigrafo Litoral Este",
    ubicacion: "Litoral Este - Mirador",
    bateria: "Bateria 77%",
    tiempoUltimoDato: "Hace 55 minutos",
    estado: { variante: "activo" },
    temperatura: "24°",
    altura: "54 mts",
    presion: "1.2 bar",
    ultimoMantenimiento: "22/05/2024",
    descripcion:
      "Cobertura para el mirador del litoral, útil para turismo y control de mareas.",
    datosExtra: [
      { label: "Dato 1", value: "Marea baja" },
      { label: "Dato 2", value: "Camino pavimentado" },
      { label: "Dato 3", value: "Panel ok" },
    ],
  },
];

export const EXTRA_LIMNIGRAFOS_STORAGE_KEY = "scarh-extra-limnigrafos";
