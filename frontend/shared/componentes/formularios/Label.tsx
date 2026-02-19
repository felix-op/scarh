type LabelProps = {
	name: string,
	text: string,
	error: boolean,
	required: boolean,
	disabled: boolean,
}

export default function Label({
	name,
	text,
	error,
	required,
	disabled,
}: LabelProps) {
	return (
		<label
			className={`text-base font-medium text-foreground select-none shrink-0
				${error ? 'text-red-500' : ''}
				${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
			`}
			htmlFor={name}
		>
			{text}
			{required && <span className="text-red-500"> *</span>}
		</label>
	);
}