"use client";
import { useState, useEffect } from "react";

export default function usePersistedState<T>(key: string, initialValue: T) {
	// Inicialización perezosa
	const [state, setState] = useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		
		try {
			const stored = window.localStorage.getItem(key);
			// Si existe, lo parseamos (para manejar objetos, números, etc.)
			// Si no existe, usamos el valor inicial proporcionado
			return stored !== null ? JSON.parse(stored) : initialValue;
		} catch (error) {
			console.error(`Error leyendo localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(state));
		} catch (error) {
			console.error(`Error guardando en localStorage key "${key}":`, error);
		}
	}, [key, state]);

	return [state, setState] as const;
}