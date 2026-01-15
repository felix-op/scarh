import { Controller, useFormContext } from "react-hook-form";

type CampoHoraProps = {
	name: string;
	label: string;
	minTime?: string | Date;
	maxTime?: string | Date;
	format?: "HH:mm";
	step?: number;
	required?: boolean;
};

const padTwo = (value: number) => String(value).padStart(2, "0");

const normalizeTime = (value?: string | Date) => {
	if (!value) return undefined;
	if (value instanceof Date) {
		return `${padTwo(value.getHours())}:${padTwo(value.getMinutes())}`;
	}
	return value;
};

const isValidTime = (value: string) => /^\d{2}:\d{2}$/.test(value);

const toMinutes = (value: string) => {
	const [hours, minutes] = value.split(":").map(Number);
	return hours * 60 + minutes;
};

export default function CampoHora({
	name,
	label,
	minTime,
	maxTime,
	format = "HH:mm",
	step = 15,
	required = false,
}: CampoHoraProps) {
	const { control, formState: { errors } } = useFormContext();

	const minValue = normalizeTime(minTime);
	const maxValue = normalizeTime(maxTime);

	const rules = {
		required: required ? { message: "Campo requerido", value: true } : undefined,
		validate: (value: string) => {
			if (!value) return true;
			if (!isValidTime(value)) return "Formato invalido";
			const minutes = toMinutes(value);
			if (minValue && minutes < toMinutes(minValue)) return "Hora fuera de rango";
			if (maxValue && minutes > toMinutes(maxValue)) return "Hora fuera de rango";
			return true;
		},
	};

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			render={({ field }) => (
				<div className="flex flex-col gap-2">
					<label className={errors[name] ? "text-red-500" : "text-[#1E1E1E]"}>
						{label}{required && <span className="text-red-500">*</span>}
					</label>
					<input
						type="time"
						value={field.value || ""}
						onChange={(e) => field.onChange(e.target.value)}
						min={minValue}
						max={maxValue}
						step={step * 60}
						placeholder={format}
						className={`w-full p-3 rounded-lg border ${errors[name] ? "border-red-500" : "border-border"}`}
					/>
					{errors[name] && <p className="text-red-500">{errors[name]?.message?.toString()}</p>}
				</div>
			)}
		/>
	);
}
