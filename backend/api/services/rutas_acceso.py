from __future__ import annotations

import math
import os
import xml.etree.ElementTree as ET
from dataclasses import dataclass
import gpxpy
from fastkml import kml
from rest_framework import serializers


MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
FORMATOS_PERMITIDOS = {".gpx": "gpx", ".kml": "kml"}
UMBRAL_RUTA_CIRCULAR_KM = 0.15
DISTANCIA_MINIMA_DESTINO_KM = 0.3


@dataclass(frozen=True)
class RutaProcesada:
    formato_origen: str
    geometria: dict
    distancia_km: float
    observaciones_sugeridas: str = ""


def procesar_archivo_ruta(archivo) -> RutaProcesada:
    nombre = getattr(archivo, "name", "") or ""
    extension = os.path.splitext(nombre.lower())[1]
    formato = FORMATOS_PERMITIDOS.get(extension)

    if not formato:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo debe tener extensión .gpx o .kml."}
        )

    size = getattr(archivo, "size", 0) or 0
    if size <= 0:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo está vacío."}
        )
    if size > MAX_FILE_SIZE_BYTES:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo no puede superar los 5 MB."}
        )

    contenido = archivo.read()
    archivo.seek(0)

    if not contenido.strip():
        raise serializers.ValidationError(
            {"archivo_original": "El archivo está vacío."}
        )

    try:
        ET.fromstring(contenido)
    except ET.ParseError:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo XML no es válido."}
        )

    try:
        segmentos = _extraer_segmentos_gpx(contenido) if formato == "gpx" else _extraer_segmentos_kml(contenido)
        observaciones_sugeridas = _extraer_observaciones_gpx(contenido) if formato == "gpx" else _extraer_observaciones_kml(contenido)
    except serializers.ValidationError:
        raise
    except Exception:
        raise serializers.ValidationError(
            {"archivo_original": "No se pudo procesar el recorrido del archivo."}
        )

    segmentos = [_validar_segmento(segmento) for segmento in segmentos if len(segmento) >= 2]
    total_puntos = sum(len(segmento) for segmento in segmentos)
    if total_puntos < 2 or not segmentos:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo debe contener una ruta con al menos dos coordenadas."}
        )

    geometria = _crear_feature_collection(segmentos)
    distancia_km = round(sum(_distancia_segmento(segmento) for segmento in segmentos), 3)

    return RutaProcesada(
        formato_origen=formato,
        geometria=geometria,
        distancia_km=distancia_km,
        observaciones_sugeridas=observaciones_sugeridas,
    )


def _extraer_segmentos_gpx(contenido: bytes) -> list[list[list[float]]]:
    try:
        gpx = gpxpy.parse(contenido.decode("utf-8-sig"))
    except Exception:
        raise serializers.ValidationError(
            {"archivo_original": "El contenido GPX no es válido."}
        )

    segmentos: list[list[list[float]]] = []

    for track in gpx.tracks:
        for segment in track.segments:
            puntos = [_punto_geojson(point.longitude, point.latitude, point.elevation) for point in segment.points]
            if puntos:
                segmentos.append(puntos)

    for route in gpx.routes:
        puntos = [_punto_geojson(point.longitude, point.latitude, point.elevation) for point in route.points]
        if puntos:
            segmentos.append(puntos)

    return segmentos


def _extraer_observaciones_gpx(contenido: bytes) -> str:
    try:
        gpx = gpxpy.parse(contenido.decode("utf-8-sig"))
    except Exception:
        return ""

    textos = []
    for item in [gpx, *gpx.tracks, *gpx.routes]:
        for atributo in ("description", "comment"):
            valor = getattr(item, atributo, None)
            if valor:
                textos.append(str(valor).strip())

    return _primer_texto_util(textos)


def _extraer_segmentos_kml(contenido: bytes) -> list[list[list[float]]]:
    try:
        documento = kml.KML()
        resultado = documento.from_string(contenido)
        if resultado is not None:
            documento = resultado
    except Exception:
        raise serializers.ValidationError(
            {"archivo_original": "El contenido KML no es válido."}
        )

    try:
        root = ET.fromstring(contenido)
    except ET.ParseError:
        raise serializers.ValidationError(
            {"archivo_original": "El archivo XML no es válido."}
        )

    segmentos: list[list[list[float]]] = []
    for element in root.iter():
        if _local_name(element.tag) != "LineString":
            continue

        coordinates = None
        for child in element.iter():
            if _local_name(child.tag) == "coordinates":
                coordinates = child.text
                break

        if coordinates:
            puntos = _parsear_coordenadas_kml(coordinates)
            if puntos:
                segmentos.append(puntos)

    return segmentos


def _extraer_observaciones_kml(contenido: bytes) -> str:
    try:
        root = ET.fromstring(contenido)
    except ET.ParseError:
        return ""

    textos = []
    for element in root.iter():
        if _local_name(element.tag) in ("description", "Snippet"):
            texto = (element.text or "").strip()
            if texto:
                textos.append(texto)

    return _primer_texto_util(textos)


def insertar_observaciones_en_archivo_ruta(
    contenido: bytes,
    observaciones: str,
    formato_origen: str,
) -> bytes:
    texto_observaciones = (observaciones or "").strip()
    if not texto_observaciones:
        return contenido

    try:
        root = ET.fromstring(contenido)
    except ET.ParseError:
        return contenido

    if formato_origen == "gpx":
        _insertar_observaciones_gpx(root, texto_observaciones)
    elif formato_origen == "kml":
        _insertar_observaciones_kml(root, texto_observaciones)
    else:
        return contenido

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def _insertar_observaciones_gpx(root: ET.Element, observaciones: str) -> None:
    metadata = _primer_hijo_directo(root, "metadata")
    contenedores = [root]
    if metadata is not None:
        contenedores.append(metadata)
    contenedores.extend(element for element in root.iter() if _local_name(element.tag) in ("trk", "rte"))

    elementos = [
        child
        for contenedor in contenedores
        for child in list(contenedor)
        if _local_name(child.tag) in ("desc", "cmt")
    ]

    if elementos:
        for element in elementos:
            element.text = observaciones
        return

    destino = metadata if metadata is not None else root
    nuevo_desc = ET.Element(_tag_con_namespace(destino, "desc"))
    nuevo_desc.text = observaciones
    destino.insert(0, nuevo_desc)


def _insertar_observaciones_kml(root: ET.Element, observaciones: str) -> None:
    document = next((element for element in root.iter() if _local_name(element.tag) == "Document"), root)
    descriptions = [
        child
        for child in list(document)
        if _local_name(child.tag) == "description"
    ]

    if descriptions:
        for element in descriptions:
            element.text = observaciones
        return

    nuevo_description = ET.Element(_tag_con_namespace(document, "description"))
    nuevo_description.text = observaciones
    document.insert(0, nuevo_description)


def _primer_hijo_directo(parent: ET.Element, tag_name: str) -> ET.Element | None:
    return next((child for child in list(parent) if _local_name(child.tag) == tag_name), None)


def _tag_con_namespace(parent: ET.Element, tag_name: str) -> str:
    tag = parent.tag
    if tag.startswith("{") and "}" in tag:
        namespace = tag[1:].split("}", 1)[0]
        return f"{{{namespace}}}{tag_name}"
    return tag_name


def _primer_texto_util(textos: list[str]) -> str:
    vistos = set()
    for texto in textos:
        normalizado = " ".join(texto.split())
        if not normalizado or normalizado in vistos:
            continue
        vistos.add(normalizado)
        return normalizado
    return ""


def _parsear_coordenadas_kml(coordinates: str) -> list[list[float]]:
    puntos = []
    for raw in coordinates.replace("\n", " ").replace("\t", " ").split():
        partes = raw.split(",")
        if len(partes) < 2:
            continue
        try:
            lon = float(partes[0])
            lat = float(partes[1])
            ele = float(partes[2]) if len(partes) >= 3 and partes[2] != "" else None
        except ValueError:
            raise serializers.ValidationError(
                {"archivo_original": "El archivo contiene coordenadas KML inválidas."}
            )
        puntos.append(_punto_geojson(lon, lat, ele))
    return puntos


def _punto_geojson(longitud: float, latitud: float, elevacion: float | None = None) -> list[float]:
    punto = [float(longitud), float(latitud)]
    if elevacion is not None:
        punto.append(float(elevacion))
    return punto


def _validar_segmento(segmento: list[list[float]]) -> list[list[float]]:
    for punto in segmento:
        longitud = punto[0]
        latitud = punto[1]
        if latitud < -90 or latitud > 90:
            raise serializers.ValidationError(
                {"archivo_original": "El archivo contiene una latitud fuera del rango -90 a 90."}
            )
        if longitud < -180 or longitud > 180:
            raise serializers.ValidationError(
                {"archivo_original": "El archivo contiene una longitud fuera del rango -180 a 180."}
            )
    return segmento


def _crear_feature_collection(segmentos: list[list[list[float]]]) -> dict:
    puntos = [punto for segmento in segmentos for punto in segmento]
    propiedades = _crear_propiedades_recorrido(puntos)

    if len(segmentos) == 1:
        geometria = {
            "type": "LineString",
            "coordinates": segmentos[0],
        }
    else:
        geometria = {
            "type": "MultiLineString",
            "coordinates": segmentos,
        }

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": propiedades,
                "geometry": geometria,
            }
        ],
    }


def _crear_propiedades_recorrido(puntos: list[list[float]]) -> dict:
    inicio = puntos[0]
    ultimo = puntos[-1]
    destino = _obtener_destino_sugerido(puntos)

    return {
        "start_coordinate": inicio,
        "end_coordinate": ultimo,
        "destination_coordinate": destino,
        "is_round_trip": destino != ultimo,
    }


def _obtener_destino_sugerido(puntos: list[list[float]]) -> list[float]:
    inicio = puntos[0]
    ultimo = puntos[-1]
    distancia_inicio_ultimo = _distancia_puntos(inicio, ultimo)

    punto_mas_lejano = max(
        puntos,
        key=lambda punto: _distancia_puntos(inicio, punto),
    )
    distancia_maxima = _distancia_puntos(inicio, punto_mas_lejano)

    if (
        distancia_inicio_ultimo <= UMBRAL_RUTA_CIRCULAR_KM
        and distancia_maxima >= DISTANCIA_MINIMA_DESTINO_KM
    ):
        return punto_mas_lejano

    return ultimo


def _distancia_segmento(segmento: list[list[float]]) -> float:
    distancia = 0.0
    for origen, destino in zip(segmento, segmento[1:]):
        distancia += _haversine_km(origen[1], origen[0], destino[1], destino[0])
    return distancia


def _distancia_puntos(origen: list[float], destino: list[float]) -> float:
    return _haversine_km(origen[1], origen[0], destino[1], destino[0])


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radio_tierra_km = 6371.0088
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radio_tierra_km * c


def _local_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if "}" in tag else tag
