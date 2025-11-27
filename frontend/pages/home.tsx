"use client";

import { useMemo, useState } from "react";
import LimnigrafoTable, {
  type LimnigrafoRowData,
} from "@/components/LimnigrafoTable";
import { Nav } from "@/components/Nav";

const MOCK_LIMNIGRAFOS: LimnigrafoRowData[] = [
  {
    id: "lim-1",
    nombre: "Limnígrafo 1",
    ubicacion: "Ubicación Limnígrafo 1",
    bateria: "Batería 92%",
    tiempoUltimoDato: "Hace 2 horas",
    estado: { variante: "activo" },
  },
  {
    id: "lim-2",
    nombre: "Limnígrafo 2",
    ubicacion: "Ubicación Limnígrafo 2",
    bateria: "Batería 80%",
    tiempoUltimoDato: "Hace 4 horas",
    estado: { variante: "activo" },
  },
  {
    id: "lim-3",
    nombre: "Limnígrafo 3",
    ubicacion: "Ubicación Limnígrafo 3",
    bateria: "Batería 56%",
    tiempoUltimoDato: "Hace 1 hora",
    estado: { variante: "activo" },
  },
  {
    id: "lim-4",
    nombre: "Limnígrafo 4",
    ubicacion: "Ubicación Limnígrafo 4",
    bateria: "En monitoreo",
    tiempoUltimoDato: "Hace 15 minutos",
    estado: { variante: "activo" },
  },
];

export default function Home() {
  const [searchValue, setSearchValue] = useState("");

  const filteredData = useMemo(() => {
    if (!searchValue) {
      return MOCK_LIMNIGRAFOS;
    }

    const normalizedSearch = searchValue.toLowerCase();

    return MOCK_LIMNIGRAFOS.filter((item) =>
      [item.nombre, item.ubicacion].some((field) =>
        field.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [searchValue]);

  return (
    <div className="flex min-h-screen w-full bg-[#EEF4FB]">
      <Nav userName="Juan Perez" userEmail="juan.perez@scarh.com" />

      <main className="flex flex-1 items-start justify-center px-6 py-10">
        <LimnigrafoTable
          data={filteredData}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => {
            console.log("Filtro por aplicar");
          }}
        />
      </main>
    </div>
  );
}
