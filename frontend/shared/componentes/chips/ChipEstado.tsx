type ChipEstadoProps = {
	etiqueta: string,
	backgroundColor: string,
	borderColor: string,
}

export default function ChipEstado({
	etiqueta,
	backgroundColor,
	borderColor
}: ChipEstadoProps) {

	return (
		<div
			className="
                flex items-center justify-center rounded-full px-2 py-1 gap-2
                shadow-[0px_4px_4px_rgba(0,0,0,0.25)] bg-chip w-35 border border-chip-border
                opacity-70 dark:opacity-100
            "
		>
			<span className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-[#1E293B] shadow-[0px_0px_4px_rgba(0,0,0,0.5)]">
				<span
					className="block h-5 w-5 rounded-full border"
					style={{ backgroundColor, borderColor }}
				/>
			</span>
			<span className="text-foreground font-bold">
				{etiqueta}
			</span>
		</div>
	);
}
