"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LimnigrafoDetailsCard from "@/components/LimnigrafoDetailsCard";
import Boton from "@/components/Boton";
import { Documet, Edit, Map as MapIcon, Ruler } from "@/components/icons/Icons";
import { Nav } from "@/components/Nav";
import {
  EXTRA_LIMNIGRAFOS_STORAGE_KEY,
  type LimnigrafoDetalleData,
  LIMNIGRAFOS,
} from "@/data/limnigrafos";

function DetalleLimnigrafoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [extraLimnigrafos] = useState<LimnigrafoDetalleData[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(EXTRA_LIMNIGRAFOS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as LimnigrafoDetalleData[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const dataset = useMemo(
    () => [...extraLimnigrafos, ...LIMNIGRAFOS],
    [extraLimnigrafos],
  );

  const limnigrafo = useMemo(() => {
    if (!selectedId) {
      return dataset[0];
    }
    return dataset.find((item) => item.id === selectedId) ?? dataset[0];
  }, [selectedId, dataset]);

  const [descripcion, setDescripcion] = useState(limnigrafo.descripcion);
  const [estaEditando, setEstaEditando] = useState(false);
  const [descripcionTemporal, setDescripcionTemporal] = useState(descripcion);

  const detalles = {
    identification: [
      { label: "ID", value: limnigrafo.id },
      { label: "Limnigrafo", value: limnigrafo.nombre },
      { label: "Bateria", value: limnigrafo.bateria },
      {
        label: "Ultimo Mantenimiento",
        value: limnigrafo.ultimoMantenimiento,
      },
    ],
    measurements: [
      { label: "Temperatura", value: limnigrafo.temperatura },
      { label: "Altura", value: limnigrafo.altura },
      { label: "Presion", value: limnigrafo.presion },
    ],
    extraData: limnigrafo.datosExtra,
    description: descripcion,
    status: limnigrafo.estado,
  };

  function abrirEdicionDescripcion() {
    setDescripcionTemporal(descripcion);
    setEstaEditando(true);
  }

  function cerrarEdicionDescripcion() {
    setEstaEditando(false);
  }

  function guardarDescripcion() {
    setDescripcion(descripcionTemporal);
    setEstaEditando(false);
  }

  return (
    <div className="flex min-h-screen w-full bg-[#EEF4FB]">
      <Nav
        userName="Juan Perez"
        userEmail="juan.perez@scarh.com"
        onProfileClick={() => router.push("/profile")}
      />

      <main className="flex flex-1 justify-center px-6 py-10">
        <div className="flex w-full max-w-[1350px] flex-col items-center gap-12">
          <div className="flex w-full max-w-[1350px] justify-start">
            <a href="/limnigrafo" className="inline-flex">
              <Boton
                type="button"
                className="
                  !mx-0
                  !bg-white
                  !text-[#7F7F7F]
                  !h-[44px]
                  !px-6
                  shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
                  hover:!bg-[#F6F6F6]
                "
              >
                ← Volver
              </Boton>
            </a>
          </div>
          <div className="flex w-full justify-center">
            <LimnigrafoDetailsCard
              title="Datos Limnigrafo"
              identification={detalles.identification}
              measurements={detalles.measurements}
              extraData={detalles.extraData}
              description={detalles.description}
              status={detalles.status}
            />
          </div>

          <div className="flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-10 px-12">
            <Boton
              className="
                !mx-0
                !bg-white
                !text-[#898989]
                !h-[48px]
                !px-8
                shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
                hover:!bg-[#F6F6F6]
                gap-2
              "
            >
              <Edit size={24} color="#898989" />
              <span className="text-[16px] font-medium">Editar Limnigrafo</span>
            </Boton>

            <Boton
              className="
                !mx-0
                !bg-white
                !text-[#898989]
                !h-[48px]
                !px-8
                shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
                hover:!bg-[#F6F6F6]
                gap-2
              "
            >
              <Ruler size={24} color="#898989" />
              <span className="text-[16px] font-medium">
                Estadisticas Del Limnigrafo
              </span>
            </Boton>

            <Boton
              onClick={abrirEdicionDescripcion}
              className="
                !mx-0
                !bg-white
                !text-[#898989]
                !h-[48px]
                !px-8
                shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
                hover:!bg-[#F6F6F6]
                gap-2
              "
            >
              <Documet size={24} color="#898989" />
              <span className="text-[16px] font-medium">Editar Descripcion</span>
            </Boton>
          </div>

          <div className="flex w-full max-w-[520px] flex-col items-center gap-4">
            <Boton
              className="
                !mx-auto
                !bg-white
                !text-[#7F7F7F]
                !h-[70px]
                !px-10
                w-full
                text-[24px]
                shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
                hover:!bg-[#F6F6F6]
                gap-3
              "
            >
              <MapIcon size={30} color="#7F7F7F" />
              <span className="font-semibold">Agregar ubicacion</span>
            </Boton>

            {estaEditando && (
              <div className="w-full rounded-2xl bg-white p-4 shadow-[0px_4px_8px_rgba(0,0,0,0.15)]">
                <label className="mb-2 block text-[16px] font-semibold text-[#4B4B4B]">
                  Nueva descripcion
                </label>
                <textarea
                  value={descripcionTemporal}
                  onChange={(event) =>
                    setDescripcionTemporal(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[#D3D4D5]
                    p-3
                    text-[16px]
                    text-[#4B4B4B]
                    outline-none
                    focus:border-[#0982C8]
                  "
                  rows={4}
                />
                <div className="mt-4 flex items-center justify-end gap-4">
                  <Boton
                    type="button"
                    onClick={cerrarEdicionDescripcion}
                    className="!mx-0 !bg-[#F3F3F3] !text-[#7F7F7F] !h-[40px] !px-6"
                  >
                    Cancelar
                  </Boton>
                  <Boton
                    type="button"
                    onClick={guardarDescripcion}
                    className="!mx-0 !h-[40px] !px-6"
                  >
                    Guardar
                  </Boton>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DetalleLimnigrafoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#EEF4FB] text-xl text-[#4B4B4B]">
          Cargando limnigrafo...
        </div>
      }
    >
      <DetalleLimnigrafoContent />
    </Suspense>
  );
}
