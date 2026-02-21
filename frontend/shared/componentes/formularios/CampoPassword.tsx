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
};

export default function CampoPassword({
	label,
	name,
	placeholder,
	disabled = false,
	isConfirm = false,
	targetName = ""
}: CampoPasswordProps) {
	const { getValues } = useFormContext();
	const [showPassword, setShowPassword] = useState(false);

	const pattern = {
		value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
		message: "Debe tener al menos 8 caracteres, letras y números"
	};
	
	const validate = (value: string) => {
		if (isConfirm && targetName) {
			const passwordPrincipal = getValues(targetName);
			return value === passwordPrincipal || "Las contraseñas no coinciden";
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
			pattern={pattern}
			validate={validate}
			required
		/>
	);
}