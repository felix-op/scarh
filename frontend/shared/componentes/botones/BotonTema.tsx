"use client";

import { useTheme } from "next-themes";

export default function BotonTema() {
	const { theme, setTheme } = useTheme();

	return (
		<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
			Cambiar a {theme === 'dark' ? 'Claro' : 'Oscuro'}
		</button>
	);
}