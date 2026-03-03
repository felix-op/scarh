import { useState, useEffect } from 'react';

// Definimos la interfaz para mayor claridad en TypeScript
interface WindowSize {
	width: number | undefined;
	height: number | undefined;
}

export function useWindowSize(): WindowSize {
	// Inicializamos con undefined para evitar discrepancias de hidratación en Next.js/SSR
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: undefined,
		height: undefined,
	});

	useEffect(() => {
		// Handler para actualizar el estado
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		// Escuchar el evento resize
		window.addEventListener("resize", handleResize);

		// Llamar a la función inmediatamente para setear el tamaño inicial
		handleResize();

		// Cleanup para evitar memory leaks
		return () => window.removeEventListener("resize", handleResize);
	}, []); // El array vacío asegura que solo se ejecute al montar

	return windowSize;
}