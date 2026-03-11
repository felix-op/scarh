import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import WrapperCampo from './WrapperCampo';

type CampoHoraProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	minTime?: string; // Formato "HH:mm"
	maxTime?: string; // Formato "HH:mm"
	step?: number; // En segundos
	required?: boolean;
};

export default function CampoHora<T extends FieldValues>({
	name,
	label,
	minTime,
	maxTime,
	step = 60000,
	required = false,
}: CampoHoraProps<T>) {

	return (
		<WrapperCampo
			name={name}
			label={label}
			rules={{
				validate: {
					formato: () => {
						const element = document.getElementsByName(name)[0] as HTMLInputElement;
						if (element?.validity?.badInput) return "La hora ingresada es inválida";
						return true;
					},
					min: (value) => {
						if (!value || !minTime) return true;
						return value as string >= minTime || `La hora mínima es ${minTime} hs`;
					},
					max: (value) => {
						if (!value || !maxTime) return true;
						return value as string <= maxTime || `La hora máxima es ${maxTime} hs`;
					},
					obligatorio: (value) => {
						if (required && !value) return "La hora es obligatoria";
						return true;
					}
				}
			}}
			render={({ field, fieldState }) => (
				<div className="relative">
					<input
						{...field}
						type="time"
						step={step}
						lang="es-AR"
						min={minTime}
						max={maxTime}
						className={`
							w-full p-3 bg-campo-input rounded-lg border
							${fieldState.invalid ? 'border-red-500' : 'border-border'}
							outline-none text-foreground
						`}
					/>
				</div>
			)}
		/>
	);
}