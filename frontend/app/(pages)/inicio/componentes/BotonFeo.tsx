"use client"

import { ReactNode } from "react"

type BotonFeoProps = {
	onClick: () => void,
	children: ReactNode
}

export default function BotonFeo({ onClick, children}: BotonFeoProps) {
	return (
		<button
			className="text-white text-xl bg-[#444] rounded-sm p-2 cursor-pointer hover:bg-[#555]"
			onClick={onClick}>
			{children}
		</button>
	);
}