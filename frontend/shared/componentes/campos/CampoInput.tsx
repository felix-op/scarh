type EndDecorationsOptions = {
	className: string;
	onClick?: () => void;
};

type CampoInputProps = {
    id?: string;
    label: string;
    name: string;
	type: string;
	placeholder: string;
	className?: string;
	icon?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	endDecorations?: EndDecorationsOptions[];
};

export default function CampoInput({
	id = '',
	label,
	name,
	type,
	placeholder,
	className = '',
	icon = '',
	value,
	onChange,
	disabled = false,
	endDecorations = [],
}: CampoInputProps) {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-base font-medium text-[#1E1E1E]" htmlFor={id || name}>{label}</label>
			<div className="relative flex flex-row items-center">
				<span className={`absolute left-3 text-2xl ${icon}`} />
				<input
					className={`w-full p-3 px-4 ${icon ? 'pl-10' : ''} ${disabled ? 'bg-gray-400' : 'bg-white'} rounded-lg border border-border outline-none text-base text-[#1E1E1E] ${className}`}
					id={id || name}
					type={type}
					value={value}
					name={name}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
				/>

				{endDecorations.map((decoration, index) => {
					return (
						<span
							key={`${name}-decoration-${index}`}
							className={`absolute right-3 text-2xl ${decoration.className}`}
							onClick={decoration.onClick}
						/>
					);
				})}
			</div>
		</div>
	);
}