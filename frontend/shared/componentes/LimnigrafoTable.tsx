/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
"use client";

import { useRouter } from "next/navigation";
import BarraBusqueda from "./BarraBusqueda";
import Boton from "./Boton";
import RenglonDatos, { type CeldaRenglonDatos } from "./RenglonDatos";
import {
	BotonEstadoLimnigrafo,
	type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";
import { ChevronRightIcon, FiltroDeslizadores } from "./icons/Icons";

export type LimnigrafoRowData = {
	id: string;
	nombre: string;
	ubicacion: string;
	bateria: string;
	tiempoUltimoDato: string;
	estado: EstadoLimnigrafo;
};

type LimnigrafoTableProps = {
	data: LimnigrafoRowData[];
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	onFilterClick?: () => void;
	onEditClick?: (limnigrafo: LimnigrafoRowData) => void;
	className?: string;
	showActions?: boolean;
};

const baseColumnTitles = [
	"Estados",
	"Limnigrafo",
	"Ubicación de Limnigrafo",
	"Batería",
	"Tiem. Último Dato",
];

const ACCION_COLUMN_TITLE = "Acciones";

const columnasTablaBase = "200px repeat(4, minmax(0, 1fr))";
const columnasTablaConAccion = `${columnasTablaBase} 240px`;

export default function LimnigrafoTable({
											data,
											className = "",
											searchValue = "",
											onSearchChange,
											onFilterClick,
											onEditClick,
											showActions = false,
										}: LimnigrafoTableProps) {
	function handleSearchChange(valor: string) {
		onSearchChange?.(valor);
	}

	const columnTitles = showActions
		? [...baseColumnTitles, ACCION_COLUMN_TITLE]
		: baseColumnTitles;

	const columnasTabla = showActions
		? columnasTablaConAccion
		: columnasTablaBase;

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
				style={{ gridTemplateColumns: columnasTabla }}
			>
				{columnTitles.map((title) => (
					<div
						key={title}
						className="text-center text-[18px] font-medium text-[#605E5E]"
					>
						{title}
					</div>
				))}
			</header>

			<div className="flex items-center gap-2 border-b border-[#D3D4D5] px-3 py-1">
				<BarraBusqueda
					valor={searchValue}
					onChange={handleSearchChange}
					className="max-w-[320px]"
				/>

				<div className="flex-1" />

				<Boton
					type="button"
					onClick={onFilterClick}
					className="
            !mx-0
            gap-2
            !bg-[#F3F3F3]
            !text-[#7F7F7F]
            !rounded-[24px]
            !h-[34px]
            !px-[14px]
            shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
            border
            border-[#E0E0E0]
          "
				>
					<FiltroDeslizadores size={18} color="#7F7F7F" />
					<span className="text-[15px] font-medium">Filtro</span>
				</Boton>
			</div>

			<div className="flex flex-col divide-y divide-[#F0F0F0]">
				{data.map((row) => (
					<LimnigrafoTableRow
						key={row.id}
						data={row}
						showActions={showActions}
						onEditClick={onEditClick}
					/>
				))}
			</div>
		</section>
	);
}

type LimnigrafoTableRowProps = {
	data: LimnigrafoRowData;
	showActions?: boolean;
	onEditClick?: (limnigrafo: LimnigrafoRowData) => void;
};

export function LimnigrafoTableRow({
									   data,
									   showActions = false,
									   onEditClick,
								   }: LimnigrafoTableRowProps) {
	const router = useRouter();

	function handleViewMore() {
		router.push(
			`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(data.id)}`,
		);
	}

	function handleEdit() {
		onEditClick?.(data);
	}

	const celdas: CeldaRenglonDatos[] = [
		{ contenido: <BotonEstadoLimnigrafo estado={data.estado} /> },
		{ contenido: data.nombre, clase: "font-normal" },
		{ contenido: data.ubicacion },
		{ contenido: data.bateria },
		{ contenido: data.tiempoUltimoDato },
	];

	if (showActions) {
		celdas.push({
			contenido: (
				<div className="flex gap-2 justify-end">
					<Boton
						type="button"
						onClick={handleEdit}
						className="
            !mx-0
            !h-[42px]
            !rounded-[24px]
            !px-[18px]
            !bg-[#E8F4FB]
            !text-[#0982C8]
            gap-2
            border
            border-[#0982C8]/20
            shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
            hover:!bg-[#D0E9F7]
          "
					>
						<span className="text-[16px] font-medium">Editar</span>
					</Boton>
					<Boton
						type="button"
						onClick={handleViewMore}
						className="
            !mx-0
            !h-[42px]
            !rounded-[24px]
            !px-[18px]
            !bg-[#F3F3F3]
            !text-[#7F7F7F]
            gap-2
            border
            border-[#E0E0E0]
            shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
            hover:!bg-[#E8E8E8]
          "
					>
						<ChevronRightIcon size={18} color="#7F7F7F" />
						<span className="text-[16px] font-medium">Ver más</span>
					</Boton>
				</div>
			),
			clase: "!justify-end",
		});
	}

	const columnasTabla = showActions
		? columnasTablaConAccion
		: columnasTablaBase;

	return (
		<RenglonDatos
			celdas={celdas}
			plantillaColumnas={columnasTabla}
			claseBaseCelda="text-[18px] font-semibold text-black"
		/>
	);
}
