import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type Option = { label: string; value: string | number };

type CampoRadioGroupProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	options: Option[];
	disabled?: boolean;
	required?: boolean;
	iconChecked?: string;
	iconUnchecked?: string;
};

export default function CampoRadioGroup<T extends FieldValues>({
	name,
	label,
	options,
	disabled = false,
	required = false,
	iconChecked = "icon-[ix--circle-dot]",
	iconUnchecked = "icon-[ix--circle]",
}: CampoRadioGroupProps<T>) {
	return (
		<WrapperCampo
			name={name}
			label={label}
			layout="stack"
			rules={{ required: required ? 'Selecciona una opción' : false }}
			disabled={disabled}
			render={({ field }) => (
				<div className="flex flex-col gap-3 mt-1">
					{options.map((option) => {
						const isSelected = field.value === option.value;
						const optionId = `${name}-${option.value}`;

						return (
							<div key={option.value} className="flex items-center gap-2">
								<input
									type="radio"
									id={optionId}
									checked={isSelected}
									onChange={() => !disabled && field.onChange(option.value)}
									className="sr-only"
									disabled={disabled}
								/>
								<label
									htmlFor={optionId}
									className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
								>
									<span className={`text-2xl ${isSelected ? `text-principal ${iconChecked}` : `text-gray-400 ${iconUnchecked}`}`} />
									<span className="text-sm text-foreground">{option.label}</span>
								</label>
							</div>
						);
					})}
				</div>
			)}
		/>
	);
}
