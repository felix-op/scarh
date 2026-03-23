import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';
import TextField from '@componentes/campos/TextField';
import { DEFAULT_VALIDATIONS } from './constantes';

export type CampoInputProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	type?: "text" | "password" | "email" | "tel" | "integer" | "number";
	icon?: string;
	disabled?: boolean;
	isLoading?: boolean;
	required?: boolean;
	pattern?: {
		value: RegExp;
		message: string;
	};
	validate?: (value: string) => boolean | string;
	endDecoration?: {
		className: string;
		onClick?: () => void;
	};
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
	validate,
	endDecoration,
}: CampoInputProps<T>) {
	const resolvedPattern =
		pattern ||
		((type === 'email' || type === 'integer' || type === "number") ? DEFAULT_VALIDATIONS[type] : undefined);

	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				required: required ? 'Este campo es obligatorio' : false,
				pattern: resolvedPattern,
				validate: validate,
			}}
			disabled={disabled}
			render={({ field, fieldState }) => (
				<TextField
					{...field}
					type={(type === "integer") ? "number" : type}
					id={name}
					placeholder={placeholder}
					disabled={disabled || isLoading}
					isLoading={isLoading}
					icon={icon}
					endDecoration={endDecoration}
					aria-invalid={fieldState.invalid}
					error={!!fieldState.error}
				/>
			)}
		/>
	);
}
