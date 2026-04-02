import FileSystem from "@componentes/campos/FileSystem";
import Icon from "@componentes/icons/Icon";
import useImportarDatos from "@hooks/useImportarDatos";

export default function ImportarDatos() {
    const {
        data,
        error,
        isLoading,
        parseFile
    } = useImportarDatos();

    return (
        <div>
            {data.length > 0 ? (
                <div>
                    <h2>Datos leídos</h2>
                    <p>
                        {JSON.stringify(data)}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <FileSystem
                        onFilesSelected={(files) => parseFile(files[0])}
                        isLoading={isLoading}
                        error={!!error}
                        accept=".json,application/json,.csv,text/csv,application/vnd.ms-excel"
                    >
                        <div className="flex flex-col  gap-2">
                            <Icon variant="file" className="text-6xl" />
                            Arrastre un archivo .json o .csv para importar los datos
                        </div>
                    </FileSystem>
                    {error && (
                        <p className="text-error">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
