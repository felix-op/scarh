import { ReactNode } from "react";

export type ColumnConfig<T> = {
    id: string;
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => ReactNode;
}

export type ActionConfig<T> = {
    typeAction: "fila" | "funcion";
    actionFn?: (row: T) => void;
    actionColumns?: (row: T) => ReactNode
}

export type PaginationConfig<T> = {
    page: number;
    maxPage: number;
    prevPage: (prev: number) => void,
    nextPage: (next: number) => void,
    lengthPages: number,
    lengthOptions: Array<number>,
    changeLength: (length: number) => void,
};
