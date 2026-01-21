import { ReactNode } from "react";

export type ColumnConfig<T> = {
    id: string;
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => ReactNode;
}

export type ActionConfig<T> = {
    typeAction?: "fila" | "funcion" | "link";
    actionLink?: string;
    actionFn?: (row: T) => void;
    actionColumns?: (row: T) => ReactNode
}