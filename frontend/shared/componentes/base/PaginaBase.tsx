"use client";

import { ReactNode } from "react";

type PaginaBaseProps = {
    children: ReactNode;
};

export default function PaginaBase({
	children,
}: PaginaBaseProps) {

	return (
		<div className="flex">
			{children}
		</div>
	);
}