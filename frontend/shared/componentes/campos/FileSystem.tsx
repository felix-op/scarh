import { DragEvent, forwardRef, ReactNode, useRef, useState } from "react";
import { InputProps } from "types/campos";

type FileSystemProps = {
    onFilesSelected?: (files: File[]) => void;
    children?: ReactNode;
    minHeight?: string;
    error?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    multiple?: boolean;
    accept?: string;
};

const FileSystem = forwardRef<HTMLInputElement, FileSystemProps
>(
    (
        {
            children = "",
            minHeight = "150px",
            error = false,
            isLoading = false,
            disabled,
            onFilesSelected,
            multiple = false,
            className = "",
            accept = "",
            ...rest
        },
        ref
    ) => {
        const [isDragging, setIsDragging] = useState(false);
        const internalInputRef = useRef<HTMLInputElement | null>(null);

        const handleFiles = (fileList: FileList | null) => {
            if (disabled || isLoading || !fileList) return;
            const filesArray = Array.from(fileList);
            onFilesSelected?.(filesArray);

            // Limpiamos el input para permitir re-selección del mismo archivo
            if (internalInputRef.current) internalInputRef.current.value = "";
        };

        const manejarDrop = (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        };

        const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFiles(e.target.files);
        };

        const alHacerClick = () => {
            if (!disabled && !isLoading) {
                internalInputRef.current?.click();
            }
        };

        return (
            <div
                className={`
                    relative w-full border-2 border-dashed rounded-lg  duration-200 
                    flex items-center justify-center overflow-hidden
                    ${(!isDragging && !disabled && !isLoading) && "hover:border-foreground/50"}
                    ${error ? "border-error" : ""}
                    ${disabled || isLoading ? "cursor-not-allowed" : "cursor-pointer transition-all"}
                    ${(disabled || isLoading)
                        ? "opacity-60 bg-campo-input-disabled"
                        : (isDragging) ? "border-principal bg-principal/5" :
                            "border-border bg-background-muted"
                    }
                    ${className}
                `}
                style={{ minHeight }}
                onDragOver={(e) => { e.preventDefault(); !disabled && setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={manejarDrop}
                onClick={() => !disabled && internalInputRef.current?.click()}
            >
                <input
                    {...rest}
                    type="file"
                    onChange={manejarChange}
                    className="hidden"
                    disabled={disabled || isLoading}
                    ref={(node) => {
                        internalInputRef.current = node;
                        if (typeof ref === "function") {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                    }}
                />

                <div className="flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-foreground-title">
                            <span className="animate-spin text-xl">◌</span>
                            <p>Cargando archivo...</p>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        );
    }
);

FileSystem.displayName = "FileSystem";

export default FileSystem;
