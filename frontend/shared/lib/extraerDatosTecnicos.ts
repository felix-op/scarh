import { DatosTecnicos } from "@tipos/Importaciones";

export default async function extraerDatosTecnicos(file: File) {
    const contenido = await file.text();
    let resultado: { datos: DatosTecnicos[], error: string } = {
        datos: [],
        error: "",
    };

    // Caso: JSON (Array de objetos)
    if (file.type === "application/json" || file.name.endsWith('.json')) {
        try {
            const json = JSON.parse(contenido);
            const data = Array.isArray(json) ? json : [json];

            resultado.datos = data.map((item: any) => ({
                temp: Number(item.temperature ?? item.temp ?? 0),
                presion: Number(item.pressure ?? item.presion ?? 0),
                fecha: item.date ?? item.fecha ?? new Date().toISOString()
            }));
        } catch (e) {
            resultado.error = "JSON malformado";
        }
    } else if (file.name.endsWith('.csv')) {
        const lineas = contenido.split(/\r?\n/).filter(l => l.trim() !== "");
        if (lineas.length < 2) {
            resultado.error = "Archivo CSV vacío";
            return resultado;
        }
        // Detectar delimitador (Soporte para Excel en ES que usa ';')
        const header = lineas[0];
        const delimitador = header.includes(';') ? ';' : ',';

        // Omitimos la cabecera (index 0) y mapeamos el resto
        resultado.datos = lineas.slice(1).map(linea => {
            const columnas = linea.split(delimitador);
            return {
                temp: parseFloat(columnas[0]) || 0,
                presion: parseFloat(columnas[1]) || 0,
                fecha: columnas[2]?.trim() || new Date().toISOString()
            };
        });
    } else {
        resultado.error = "Formato de archivo no soportado";
    }

    return resultado;
}
