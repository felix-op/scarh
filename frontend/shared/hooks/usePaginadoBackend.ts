import { PaginationConfig } from '@componentes/tabla/types';
import { Paginado } from '@servicios/api/types';
import { Dispatch, SetStateAction } from 'react';

type UsePaginarListaProps<T> = {
	data?: Paginado<T>;
	page: number;
	setPage: Dispatch<SetStateAction<number>>; 
    lengthPages: number;
	lengthOptions: number[];
	setLengthPages: Dispatch<SetStateAction<number>>;
};

export default function usePaginadoBackend<T>({
	data,
	page,
	setPage,
	lengthPages,
	lengthOptions,
	setLengthPages,
}: UsePaginarListaProps<T>): PaginationConfig {
	const changeLength = (length: number) => {
		setPage(1);
		setLengthPages(length);
	};

	const prevPage = () => {
		if (data?.previous) {
			setPage((prev) => prev-1);
		}
	};

	const nextPage = () => {
		if (data?.next) {
			setPage((prev) => prev+1);
		}
	};

	const maxPage = Math.ceil((data?.count || 1) / lengthPages);

	return {
		page,
		lengthPages,
		lengthOptions,
		maxPage,
		changeLength,
		prevPage,
		nextPage
	};
}
