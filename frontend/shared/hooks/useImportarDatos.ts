import { useState, useCallback } from 'react';
import { DatosTecnicos } from '@tipos/Importaciones';
import extraerDatosTecnicos from '@lib/extraerDatosTecnicos';

export default function useImportarDatos() {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [data, setData] = useState<DatosTecnicos[]>([]);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback(async (file: File) => {
        // Reset de estados para una nueva carga
        setIsLoading(true);
        setError(null);
        setFileName(file.name);

        try {
            const resultado = await extraerDatosTecnicos(file);

            if (resultado.error) {
                setError(resultado.error);
                setData([]);
            } else {
                setData(resultado.datos);
            }
        } catch (e) {
            setError("Error inesperado al procesar el archivo.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clear = () => {
        setData([]);
        setFileName("");
        setError(null);
    };

    return {
        isLoading,
        fileName,
        data,
        error,
        parseFile,
        clear,
        setData
    };
};