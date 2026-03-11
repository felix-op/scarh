import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type CampoFechaProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	minDate?: Date;
	maxDate?: Date;
	required?: boolean;
	// Permite configurar qué partes se piden, por defecto completo
	precision?: 'full' | 'month-year' | 'day-month';
};

export default function CampoFecha<T extends FieldValues>({
	name,
	label,
	minDate,
	maxDate,
	required = false,
	precision = 'full'
}: CampoFechaProps<T>) {

	// Helper para formatear Date a string YYYY-MM-DD que entiende el input
	const formatDateForInput = (date?: Date) => date?.toISOString().split('T')[0];

	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				validate: {
					formato: () => {
						const element = document.getElementsByName(name)[0] as HTMLInputElement;
						if (element?.validity?.badInput) {
							return "La fecha ingresada no es válida";
						}
						return true;
					},
					range: (value) => {
						if (!value && !required) return true;
						const dateValue = new Date(value);
						if (minDate && dateValue < minDate) return `La fecha mínima es ${minDate.toLocaleDateString()}`;
						if (maxDate && dateValue > maxDate) return `La fecha máxima es ${maxDate.toLocaleDateString()}`;
						return true;
					},
					wObligatorio: (value) => {
						if (required && !value) return 'Este campo es obligatorio';
						return true;
					}
				}
			}}
			render={({ field, fieldState }) => (
				<div className="relative">
					<input
						{...field}
						type={precision === 'month-year' ? 'month' : 'date'}
						min={formatDateForInput(minDate)}
						max={formatDateForInput(maxDate)}
						className={`
							w-full p-3 bg-campo-input rounded-lg border
							${fieldState.invalid ? 'border-red-500' : 'border-border'}
							outline-none text-foreground uppercase
						`}
					/>
				</div>
			)}
		/>
	);
}