import { useEffect, useRef, useState } from "react";
import TextField from "./TextField";

type SearchFieldProps = {
	placeholder: string
	initialSearch?: string
	onSearch: (value: string) => void
};

export default function SearchField({
	onSearch,
	placeholder,
	initialSearch = "",
}: SearchFieldProps) {
	const [busqueda, setBusqueda] = useState(initialSearch);
	const onSearchRef = useRef(onSearch);

	useEffect(() => {
		onSearchRef.current = onSearch;
	}, [onSearch]);

	useEffect(() => {
		setBusqueda(initialSearch);
	}, [initialSearch]);
	
	useEffect(() => {
		const timeOut = setTimeout(() => {
			if (onSearchRef.current) {
				onSearchRef.current(busqueda);
			}
		}, 300);

		return () => clearTimeout(timeOut);
	}, [busqueda]);

	return (
		<TextField
			value={busqueda}
			onChange={(e) => setBusqueda(e.target.value)}
			style={{
				borderRadius: "20px",
				boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)",
			}}
			placeholder={placeholder}
			icon="icon-[mdi--magnify]"
			endDecoration={{
				className: "icon-[fa7-solid--remove] text-sm right-4 hover:cursor-pointer hover:text-principal ",
				onClick: () => setBusqueda(""),
			}}
		/>
	);
}
