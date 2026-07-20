import { FiltersPlaceholder, TablePlaceholder } from "@components";

export default function HistorialLoading() {
  return (
    <div className="flex flex-col gap-6">
      <FiltersPlaceholder count={5} />
      <TablePlaceholder rows={8} />
    </div>
  );
}
