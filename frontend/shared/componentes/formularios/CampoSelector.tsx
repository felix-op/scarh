import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';
import Selector from '@componentes/campos/Selector';

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
				<Selector
					{...field}
					disabled={disabled}
					isLoading={isLoading}
					error={fieldState.invalid}

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
				</Selector>
			)}
		/>
	);
}
