"use client";

import type { ReactNode } from "react";

export type CeldaRenglonDatos = {
  contenido: ReactNode;
  clase?: string;
};

type RenglonDatosProps = {
  celdas: CeldaRenglonDatos[];
  plantillaColumnas?: string;
  claseContenedor?: string;
  claseBaseCelda?: string;
};

export function RenglonDatos({
	celdas,
	plantillaColumnas,
	claseContenedor = "",
	claseBaseCelda = "",
}: RenglonDatosProps) {
	const columnas =
    plantillaColumnas ?? `repeat(${celdas.length}, minmax(0, 1fr))`;

	return (
		<div
			className={`
        grid
        items-center
        gap-4
        px-6
        py-4
        ${claseContenedor}
      `}
			style={{ gridTemplateColumns: columnas }}
		>
			{celdas.map((celda, indice) => (
				<div
					key={`renglon-datos-celda-${indice}`}
					className={`
            flex
            h-full
            items-center
            justify-center
            text-center
            ${claseBaseCelda}
            ${celda.clase ?? ""}
          `}
				>
					{celda.contenido}
				</div>
			))}
		</div>
	);
}

export default RenglonDatos;
