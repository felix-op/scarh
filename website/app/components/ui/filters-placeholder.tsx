export interface FiltersPlaceholderProps {
  count?: number;
  className?: string;
}

export function FiltersPlaceholder({ count = 5, className = "" }: FiltersPlaceholderProps) {
  return (
    <div className={`flex flex-col md:flex-row gap-4 animate-pulse ${className}`.trim()}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 w-full md:w-48 rounded-shape-sm bg-background-muted" />
      ))}
    </div>
  );
}

export default FiltersPlaceholder;
