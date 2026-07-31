import { getServerLimnigrafos } from "@services";
import { LayoutBase, MapaDynamic } from "@components";

export default async function MapaPage() {
  const initialData = await getServerLimnigrafos({ queryParams: { limit: 1000, page: 1 } });

  return (
    <LayoutBase noPadding>
      <div className="h-full w-full">
        <MapaDynamic initialData={initialData} />
      </div>
    </LayoutBase>
  );
}
