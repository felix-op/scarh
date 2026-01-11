export type ColumnConfig<T> = {
    id: string;
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
}