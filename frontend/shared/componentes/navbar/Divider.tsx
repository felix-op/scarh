type DividerProps = {
	direccion: "horizontal" | "vertical"
}

export default function Divider({ direccion }: DividerProps) {
	if (direccion==="horizontal") {
		return <div className="h-px w-full bg-[#D3D4D5]" />
	}

	return <div className="w-px h-full bg-[#D3D4D5]" />
}