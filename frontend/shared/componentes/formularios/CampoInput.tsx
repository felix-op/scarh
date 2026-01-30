import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type CampoInputProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	type?: 'text' | 'password' | 'email' | 'number';
	disabled?: boolean;
	isLoading?: boolean;
	required?: boolean;
	pattern?: {
		value: RegExp;
		message: string;
	};
};

export default function CampoInput<T extends FieldValues>({
	name,
	label,
	placeholder,
	type = 'text',
	disabled = false,
	isLoading = false,
	required = false,
	pattern,
}: CampoInputProps<T>) {
	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				required: required ? 'Este campo es obligatorio' : false,
				pattern: pattern,
			}}
			render={({ field, fieldState }) => (
				<div className="input-relative-container">
					<input
						{...field}
						type={type}
						placeholder={placeholder}
						disabled={disabled || isLoading}
						aria-invalid={fieldState.invalid}
						className={`input-base ${fieldState.error ? 'input-error' : ''}`}
					/>

					{isLoading && (
						<span className="loading-spinner">Cargando...</span>
					)}
				</div>
			)}
		/>
	);
}