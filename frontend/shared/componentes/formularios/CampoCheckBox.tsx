import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type CampoCheckboxProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	disabled?: boolean;
	required?: boolean;
	labelPosition?: 'left' | 'right';
	iconChecked?: string;
    iconUnchecked?: string;
};

export default function CampoCheckbox<T extends FieldValues>({
	name,
	label,
	disabled = false,
	required = false,
	labelPosition = 'right',
	iconChecked = "icon-[bx--check-square]",
	iconUnchecked = "icon-[bx--square]",
}: CampoCheckboxProps<T>) {
	
	return (
		<WrapperCampo
			name={name}
			label={label}
			layout={labelPosition === 'right' ? 'row-reverse' : 'row'}
			rules={{
				required: required ? 'Este campo es obligatorio' : false,
			}}
			disabled={disabled}
			render={({ field }) => {
				const isChecked = !!field.value;

				return (
					<div 
						className={`relative flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
					>
						<input
							{...field}
							type="checkbox"
							id={name}
							checked={isChecked}
							onChange={(e) => field.onChange(e.target.checked)}
							disabled={disabled}
							className="sr-only"
						/>

						<span 
							className={`text-2xl transition-colors ${isChecked ? `text-principal ${iconChecked}` : `text-gray-400 ${iconUnchecked}`}`} 
						/>
					</div>
				);
			}}
		/>
	);
}