import { useState, useMemo } from 'react';

type UsePaginarListaProps<T> = {
    data?: T[];
    initialLimit?: number;
};

type UsePaginarListaReturn<T> = {
    page: number;
    lengthPages: number;
    maxPage: number;
    items: T[];
    changeLength: (value: number) => void;
    prevPage: (value: number) => void;
    nextPage: (value: number) => void;
};

/**
 * Hook para gestionar la segmentación de un array y el estado del paginador.
 */
export default function usePaginarTabla<T>({
	data = [], initialLimit = 3
}: UsePaginarListaProps<T>): UsePaginarListaReturn<T> {
	const [page, setPage] = useState(1);
	const [lengthPages, setLimite] = useState(initialLimit);

	// Memorizamos los cálculos para evitar re-slices innecesarios
	const { items, maxPage } = useMemo(() => {
		const total = Math.ceil(data.length / lengthPages);
		const inicio = (page - 1) * lengthPages;
		return {
			items: data.slice(inicio, inicio + lengthPages),
			maxPage: total
		};
	}, [data, page, lengthPages]);

	const changeLength = (value: number) => {
		setLimite(value);
		setPage(1);
	};

	const prevPage = (value: number) => {
		setPage(value);
	};

	const nextPage = (value: number) => {
		setPage(value);
	};

	return {
		page,
		lengthPages,
		maxPage,
		items,
		changeLength,
		prevPage,
		nextPage
	};
}
