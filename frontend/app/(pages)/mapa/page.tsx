"use client";

import dynamic from "next/dynamic";
import { MapViewProps } from "@componentes/MapView";
import PaginaBase from "@componentes/base/PaginaBase";

const MapView = dynamic<MapViewProps>(() => import("@componentes/MapView"), {
	ssr: false,
});

export default function MapPage() {
	return (
		<PaginaBase noPadding>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">

				<main className="flex flex-1">
					<div className="flex-1 min-h-screen">
						<MapView resizeToken={0} />
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
