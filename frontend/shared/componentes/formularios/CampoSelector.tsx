import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type Option = {
	label: string;
	value: string | number;
};

type CampoSelectorProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	options: Option[];
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	isLoading?: boolean;
};

export default function CampoSelector<T extends FieldValues>({
	name,
	label,
	options,
	placeholder,
	required = false,
	disabled = false,
	isLoading = false,
}: CampoSelectorProps<T>) {
	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				required: required ? 'Debe seleccionar una opción' : false,
			}}
			disabled={disabled}
			render={({ field, fieldState }) => (
				<div className="relative flex items-center">
					<select
						{...field}
						disabled={disabled || isLoading}
						aria-invalid={fieldState.invalid}
						className={`
                            w-full p-3 px-4 rounded-lg border outline-none text-base appearance-none transition-colors
                            ${fieldState.invalid ? 'border-red-500' : 'border-border'}
                            ${disabled || isLoading ? 'bg-campo-input-disabled cursor-not-allowed opacity-70' : 'bg-campo-input cursor-pointer'}
                            text-foreground
                        `}
					>
						{placeholder && (
							<option value="" disabled>
								{isLoading ? 'Cargando opciones...' : placeholder}
							</option>
						)}

						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<div className="absolute right-3 pointer-events-none flex items-center">
						{isLoading ? (
							<span className="animate-spin h-5 w-5 border-2 border-principal border-t-transparent rounded-full" />
						) : (
							<span className="icon-[bx--chevron-down] text-2xl text-gray-400" />
						)}
					</div>
				</div>
			)}
		/>
	);
}