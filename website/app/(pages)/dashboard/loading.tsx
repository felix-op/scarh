import { LayoutBase } from "@components";

function Bloque({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-shape-md border border-border bg-card ${className}`.trim()} />;
}

/** Skeleton que conserva la misma grilla del inicio mientras llegan sus estadísticas. */
export default function DashboardLoading() {
  return (
    <LayoutBase>
      <div className="grid flex-1 grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-5 xl:grid-rows-5">
        <Bloque className="min-h-24 xl:col-start-1 xl:row-start-1" />
        <Bloque className="min-h-24 xl:col-start-1 xl:row-start-2" />
        <Bloque className="min-h-56 xl:col-span-2 xl:col-start-2 xl:row-span-2 xl:row-start-1" />
        <Bloque className="min-h-72 xl:col-span-3 xl:col-start-1 xl:row-span-3 xl:row-start-3" />
        <Bloque className="min-h-96 xl:col-span-2 xl:col-start-4 xl:row-span-5 xl:row-start-1" />
      </div>
    </LayoutBase>
  );
}
