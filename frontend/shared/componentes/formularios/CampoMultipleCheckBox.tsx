import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type Option = {
	label: string;
	value: string | number;
};

type CampoMultiCheckboxProps<T extends FieldValues> = {
	name: Path<T>;
	options: Option[];
	label?: string;
	className?: string;
	disabled?: boolean;
	required?: boolean;
	iconChecked?: string;
	iconUnchecked?: string;
};

export default function CampoMultiCheckbox<T extends FieldValues>({
	name,
	options,
	label = "",
	className = "",
	disabled = false,
	required = false,
	iconChecked = "icon-[bx--check-square]",
	iconUnchecked = "icon-[bx--square]",
}: CampoMultiCheckboxProps<T>) {

	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				required: required ? 'Selecciona al menos una opción' : false,
			}}
			disabled={disabled}
			render={({ field }) => {
				// Forzamos que el valor sea siempre un array para evitar errores de .includes
				const currentValues = (Array.isArray(field.value) ? field.value : []) as (string | number)[];

				const handleToggle = (optionValue: string | number) => {
					if (disabled) return;

					const nextValue = currentValues.includes(optionValue)
						? currentValues.filter((v: string | number) => v !== optionValue)
						: [...currentValues, optionValue];

					field.onChange(nextValue);
				};

				return (
					<div className={`grid gap-2 ${className}`}>
						{options.map((option) => {
							const isChecked = currentValues.includes(option.value);

							return (
								<div
									key={option.value}
									onClick={() => handleToggle(option.value)}
									className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
								>
									<div className="relative flex items-center justify-center">
										<input
											type="checkbox"
											checked={isChecked}
											className="sr-only"
											readOnly
										/>
										<span
											className={`
												text-2xl transition-colors
												${isChecked ? `text-principal ${iconChecked}` : `text-gray-400 ${iconUnchecked}`}
											`}
										/>
									</div>
									{option.label && (
										<span className="text-sm select-none">{option.label}</span>
									)}
								</div>
							);
						})}
					</div>
				);
			}}
		/>
	);
}
