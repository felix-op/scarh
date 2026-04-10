import { MenuOpcion } from "@componentes/menu/MenuAcciones";
import { ReactNode } from "react";

export type ColumnConfig<T> = {
    id: string;
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => ReactNode;
}

export type TableMenuOption<T> = Omit<MenuOpcion, "onClick" | "value"> & {
    onClick: (row: T) => void;
};

export type ActionConfig<T> = {
    typeAction: "fila" | "funcion" | "menu";
    options?: TableMenuOption<T>[];
    actionFn?: (row: T) => void;
    actionColumns?: (row: T) => ReactNode
}

export type PaginationConfig = {
    page: number;
    maxPage: number;
    prevPage: (prev: number) => void,
    nextPage: (next: number) => void,
    lengthPages: number,
    lengthOptions: Array<number>,
    changeLength: (length: number) => void,
};

export type DataTableStyles<T> = {
    rootClassName?: string;
    cardClassName?: string;
    scrollerClassName?: string;
    topBarClassName?: string;
    tableClassName?: string;
    theadClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string;
    tbodyClassName?: string;
    rowClassName?: string | ((row: T, index: number) => string);
    cellClassName?: string;
    emptyCellClassName?: string;
    hiddenRowHover?: boolean;
}
