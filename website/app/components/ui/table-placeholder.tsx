export interface TablePlaceholderProps {
  rows?: number;
  className?: string;
}

export function TablePlaceholder({ rows = 8, className = "" }: TablePlaceholderProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-shape-md border border-border bg-card p-4 overflow-hidden animate-pulse ${className}`.trim()}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded-shape-sm bg-background-muted" />
      ))}
    </div>
  );
}

export default TablePlaceholder;
