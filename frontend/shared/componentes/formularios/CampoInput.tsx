import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type EndDecorationsOptions = {
	className: string;
	onClick?: () => void;
};

type CampoInputProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	type?: 'text' | 'password' | 'email' | 'number';
	icon?: string;
	disabled?: boolean;
	isLoading?: boolean;
	required?: boolean;
	pattern?: {
		value: RegExp;
		message: string;
	};
	endDecorations?: EndDecorationsOptions[];
};

export default function CampoInput<T extends FieldValues>({
	name,
	label,
	placeholder,
	type = 'text',
	icon = "",
	disabled = false,
	isLoading = false,
	required = false,
	pattern,
	endDecorations = [],
}: CampoInputProps<T>) {
	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				required: required ? 'Este campo es obligatorio' : false,
				pattern: pattern,
			}}
			disabled={disabled}
			render={({ field, fieldState }) => (
				<div className="relative flex flex-row items-center">
					<span className={`absolute left-3 text-2xl ${icon}`} />
					<input
						{...field}
						type={type}
						placeholder={placeholder}
						disabled={disabled || isLoading}
						aria-invalid={fieldState.invalid}
						className={`w-full p-3 px-4 ${icon ? 'pl-10' : ''} ${disabled ? 'bg-campo-input-disabled cursor-not-allowed' : 'bg-campo-input'} rounded-lg border border-border outline-none text-base text-foreground`}
					/>

					{isLoading && (
						<span className="loading-spinner">Cargando...</span>
					)}

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
			)}
		/>
	);
}