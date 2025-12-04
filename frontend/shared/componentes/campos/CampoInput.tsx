import { Controller, useFormContext } from "react-hook-form";

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
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	endDecorations?: EndDecorationsOptions[];
	required?: boolean;
};

export default function CampoInput({
	id = '',
	label,
	name,
	type,
	placeholder,
	className = '',
	icon = '',
	disabled = false,
	endDecorations = [],
	required = false,
}: CampoInputProps) {
	const { control, formState: { errors } } = useFormContext();

	const rules = {
		required: required ? { message: 'Campo requerido', value: true } : undefined,
	}

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			render={({field}) => (
				<div className="flex flex-col gap-2">
					<label className={`text-base font-medium text-[#1E1E1E] ${required && errors[name] ? 'text-red-500' : ''}`} htmlFor={id || name}>{label} {required && <span className="text-red-500">*</span>}</label>
					<div className="relative flex flex-row items-center">
						<span className={`absolute left-3 text-2xl ${icon}`} />
						<input
							className={`w-full p-3 px-4 ${icon ? 'pl-10' : ''} ${disabled ? 'bg-gray-400' : 'bg-white'} rounded-lg border border-border outline-none text-base text-[#1E1E1E] ${className}`}
							{...field}
							id={id || name}
							type={type}
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
					{errors[name] && <p className="text-red-500">{errors[name]?.message?.toString() || 'Campo requerido'}</p>}
				</div>
			)}
		/>
	);
}