import { FiltersPlaceholder, TablePlaceholder } from "@components";

export default function UsuariosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <FiltersPlaceholder count={3} />
      <TablePlaceholder rows={8} />
    </div>
  );
}
