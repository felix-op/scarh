"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RedireccionDetalleLimnigrafo() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const limnigrafoID = params?.id || "";

	useEffect(() => {
		if (!limnigrafoID) {
			router.replace("/limnigrafos");
			return;
		}

		router.replace(
			`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(limnigrafoID)}`,
		);
	}, [limnigrafoID, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#EEF4FB] text-xl text-[#4B4B4B] dark:bg-[#0B1220] dark:text-[#94A3B8]">
			Redirigiendo al detalle del limnigrafo...
		</div>
	);
}
