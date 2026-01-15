import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

type CampoFechaProps = {
	name: string;
	label: string;
	format?: "dd/MM/yyyy";
	minDate?: Date;
	maxDate?: Date;
	required?: boolean;
};


//Formateamos Date, para que sea el del format del Props
const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`; 

const parseDate = (value: string) => {
  const [dd, mm, yyyy] = value.split("/");
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
};



export default function CampoFecha({
	name,
	format = "dd/MM/yyyy",
	label,
	minDate,
	maxDate,
	required = false,
}: CampoFechaProps) {
	const { control, formState: { errors }, setError, clearErrors } = useFormContext();
	const watchedValue = useWatch({ control, name });
	const [inputValue, setInputValue] = useState("");

	const rules = {
		required: required ? { message: "Campo requerido", value: true } : undefined,
		validate: (value: string | null) => {
			if (!value) return true;
			const parsed = new Date(value);
			if (Number.isNaN(parsed.getTime())) return "Formato invalido";
			if (minDate && parsed < minDate) return "Fecha fuera de rango";
			if (maxDate && parsed > maxDate) return "Fecha fuera de rango";
			return true;
		},
	};

	useEffect(() => {
		if (!watchedValue || typeof watchedValue !== "string") {
			setInputValue("");
			return;
		}

		const parsed = new Date(watchedValue);
		setInputValue(Number.isNaN(parsed.getTime()) ? "" : formatDate(parsed));
	}, [watchedValue]);

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
					type="text"
					placeholder={format}
					value={inputValue}
					onChange={(e) => {
						const nextValue = e.target.value;
						setInputValue(nextValue);

						if (!nextValue) {
							field.onChange(null);
							clearErrors(name);
							return;
						}

						const parsed = parseDate(nextValue);
						if (parsed) {
							field.onChange(parsed.toISOString());
							clearErrors(name);
						}
					}}
					onBlur={() => {
						if (!inputValue) return;
						const parsed = parseDate(inputValue);
						if (!parsed) {
							setError(name, { type: "validate", message: "Formato invalido" });
							return;
						}
						if (minDate && parsed < minDate) {
							setError(name, { type: "validate", message: "Fecha fuera de rango" });
							return;
						}
						if (maxDate && parsed > maxDate) {
							setError(name, { type: "validate", message: "Fecha fuera de rango" });
							return;
						}
						clearErrors(name);
					}}
					className={`w-full p-3 rounded-lg border ${errors[name] ? "border-red-500" : "border-border"}`}
                />
                {errors[name] && <p className="text-red-500">{errors[name]?.message?.toString()}</p>}
                </div>
            )}
        />

    )







}
