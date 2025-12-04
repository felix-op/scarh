/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
"use client";

import {
    BotonEstadoLimnigrafo,
    type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";
import RenglonDatos, { type CeldaRenglonDatos } from "./RenglonDatos";

type TablaHomeRow = {
    id: string;
    nombre: string;
    bateria: string;
    tiempoUltimoDato: string;
    estado: EstadoLimnigrafo;
    // puede venir también "ubicacion" pero acá no la usamos
};

type TablaHomeProps = {
    data: TablaHomeRow[];
    className?: string;
};

const baseColumnTitles = [
    "Estados",
    "Limnigrafo",
    "Batería",
    "Tiem. Último Dato",
];

// Estados + 3 columnas
const columnasTablaBase = "200px repeat(3, minmax(0, 1fr))";

export default function TablaHome({
                                      data,
                                      className = "",
                                  }: TablaHomeProps) {
    return (
        <section
            className={`
        w-full max-w-[1568px]
        rounded-[20px]
        bg-white
        shadow-[1px_6px_12px_rgba(0,0,0,0.25)]
        overflow-hidden custom-scroll
        font-outfit
        ${className}
      `}
        >
            <header
                className="grid items-center gap-4 border-b border-[#6E6F72]/30 px-5 py-2"
                style={{ gridTemplateColumns: columnasTablaBase }}
            >
                {baseColumnTitles.map((title) => (
                    <div
                        key={title}
                        className="text-center text-[18px] font-medium text-[#605E5E]"
                    >
                        {title}
                    </div>
                ))}
            </header>

            <div className="flex flex-col divide-y divide-[#F0F0F0]">
                {data.map((row) => (
                    <TablaHomeRow
                        key={row.id}
                        data={row}
                    />
                ))}
            </div>
        </section>
    );
}

type TablaHomeRowProps = {
    data: TablaHomeRow;
};

function TablaHomeRow({ data }: TablaHomeRowProps) {
    const celdas: CeldaRenglonDatos[] = [
        { contenido: <BotonEstadoLimnigrafo estado={data.estado} /> },
        { contenido: data.nombre, clase: "font-normal" },
        { contenido: data.bateria },
        { contenido: data.tiempoUltimoDato },
    ];

    return (
        <RenglonDatos
            celdas={celdas}
            plantillaColumnas={columnasTablaBase}
            claseBaseCelda="text-[18px] font-semibold text-black"
        />
    );
}
