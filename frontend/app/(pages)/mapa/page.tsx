"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Nav } from "@componentes/Nav";
import { MapViewProps } from "@componentes/MapView";
import PaginaBase from "@componentes/base/PaginaBase";

const MapView = dynamic<MapViewProps>(() => import("@componentes/MapView"), {
	ssr: false,
});

export default function MapPage() {
	const router = useRouter();
	const [resizeToken, setResizeToken] = useState(0);

	const handleCollapseChange = useCallback(() => {
		setResizeToken((token) => token + 1);
	}, []);

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onCollapseChange={handleCollapseChange}
					onProfileClick={() => router.push("/perfil")}
				/>

				<main className="flex flex-1">
					<div className="flex-1 min-h-screen">
						<MapView resizeToken={resizeToken} />
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
