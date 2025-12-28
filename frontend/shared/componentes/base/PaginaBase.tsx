"use client";

import { ReactNode } from "react";
import styles from "./PaginaBase.module.css";

type PaginaBaseProps = {
    children: ReactNode;
	noPadding?: boolean;
	flex?: boolean;
};

export default function PaginaBase({
	children,
	noPadding = false,
	flex = false,
}: PaginaBaseProps) {

	const className = [
		styles['pagina-base'],
		noPadding ? " p-0" : " p-5 sm:p-10",
		flex ? "flex flex-col" : "",
	].join(" ");

	return (
		<div className={className}>
			{children}
		</div>
	);
}