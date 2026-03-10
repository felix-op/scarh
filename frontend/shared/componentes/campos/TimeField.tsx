type TimeFieldProps = {
	value: string
	onChange: (value: string) => void
};

export default function TimeField({ value, onChange }: TimeFieldProps) {
	return (
		<input
			type='date'
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={`
				w-full p-3 bg-campo-input rounded-lg border border-border
				outline-none text-foreground uppercase
			`}
			style={{boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)"}}
		/>
	);
}
