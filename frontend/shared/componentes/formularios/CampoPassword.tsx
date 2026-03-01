import { useState } from "react";
import CampoInput from "./CampoInput";
import { useFormContext } from "react-hook-form";

type CampoPasswordProps = {
	label: string,
	name: string,
	placeholder: string,
	disabled?: boolean,
	isConfirm?: boolean,
	targetName?: string,
	pattern?: {
		value: RegExp;
		message: string;
	},
	validate?: (value: string) => boolean | string,
};

export default function CampoPassword({
	label,
	name,
	placeholder,
	disabled = false,
	isConfirm = false,
	targetName = "",
	pattern,
	validate: customValidate,
}: CampoPasswordProps) {
	const { getValues } = useFormContext();
	const [showPassword, setShowPassword] = useState(false);

	const defaultPattern = {
		value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
		message: "Debe tener al menos 8 caracteres, letras y números"
	};

	const resolvedPattern = pattern ?? defaultPattern;

	const validate = (value: string) => {
		if (isConfirm && targetName) {
			const passwordPrincipal = getValues(targetName);
			return value === passwordPrincipal || "Las contraseñas no coinciden";
		}

		if (customValidate) {
			return customValidate(value);
		}

		return true;
	};

	return (
		<CampoInput
			label={label}
			name={name}
			type={showPassword ? "text" : "password"}
			placeholder={placeholder}
			icon="icon-[mdi--lock] text-gray-600"
			disabled={disabled}
			endDecoration={{
				className: `${showPassword ? 'icon-[mdi--eye-off]' : 'icon-[mdi--eye]'} text-gray-600 hover:text-gray-800 cursor-pointer`,
				onClick: () => setShowPassword((prev) => !prev)
			}}
			pattern={resolvedPattern}
			validate={validate}
			required
		/>
	);
}
