import { ReactNode } from "react"

type DataTableRowProps<T> = {
    hover?: boolean
    border?: boolean
    animation?: boolean
    index: number
    className?: string | ((row: T, index: number) => string)
    handleAction: (row: T) => void
    row: T
    children: ReactNode
}

export default function DataTableRow<T>({
    hover = false,
    border = false,
    animation = false,
    className = "",
    handleAction,
    row,
    index,
    children
}: DataTableRowProps<T>) {

    const classNameFinal = [
        hover ? "hover:bg-table-hover" : "",
        border ? "border dark:border-white/5" : "",
        animation ? "opacity-0 animate-fade-in-up" : "",
        typeof className === "function" ? className(row, index) : className
    ].join(" ");

    return (
        <tr
            className={classNameFinal}
            style={{
                animationDelay: animation ? `${index * 0.05}s` : undefined,
            }}
            onClick={() => handleAction(row)}
        >
            {children}
        </tr>
    );
}
