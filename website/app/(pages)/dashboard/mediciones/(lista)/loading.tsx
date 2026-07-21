import { FiltersPlaceholder, TablePlaceholder } from "@components";

export default function MedicionesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <FiltersPlaceholder count={6} />
      <TablePlaceholder rows={8} />
    </div>
  );
}
