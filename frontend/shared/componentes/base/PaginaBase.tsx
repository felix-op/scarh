"use client";

import { useLoginContext } from "@componentes/providers/LoginProvider";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type PaginaBaseProps = {
    children: ReactNode;
};

export default function PaginaBase({
	children,
}: PaginaBaseProps) {
	const { usuario } = useLoginContext();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setTimeout(() => {
			if (!usuario) {
				router.replace("/login");
			} else {
				setLoading(false);
			}
		}, 0);
	}, [usuario, router]);

	return (
		<div>
			{loading ? <div>Verificando sesión...</div> : children}
		</div>
	);
}