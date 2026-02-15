import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';
import TextField from '@componentes/campos/TextField';

type CampoInputProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	type?: "text" | "password" | "email" | "tel";
	icon?: string;
	disabled?: boolean;
	isLoading?: boolean;
	required?: boolean;
	pattern?: {
		value: RegExp;
		message: string;
	};
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
	endDecoration,
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
				<TextField
					{...field}
					type={type}
					placeholder={placeholder}
					disabled={disabled || isLoading}
					isLoading={isLoading}
					icon={icon}
					endDecoration={endDecoration}
					aria-invalid={fieldState.invalid}
				/>
			)}
		/>
	);
}