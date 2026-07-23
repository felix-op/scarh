import { getServerLimnigrafos } from "@services";
import { MapaDynamic } from "@components";

export default async function MapaPage() {
  const initialData = await getServerLimnigrafos({ queryParams: { limit: 1000, page: 1 } });

  return (
    <div className="h-[calc(100vh-2rem)] w-full">
      <MapaDynamic initialData={initialData} />
    </div>
  );
}
