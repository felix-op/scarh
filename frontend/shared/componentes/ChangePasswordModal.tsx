"use client";

import CampoPassword from "@componentes/formularios/CampoPassword";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { useState } from "react";

type ChangePasswordForm = {
	password: string;
	confirmPassword: string;
};

type ChangePasswordModalProps = {
	open: boolean;
	onCancel: () => void;
	onSave: (password: string) => void;
	isSaving?: boolean;
};

const defaultForm: ChangePasswordForm = {
	password: "",
	confirmPassword: "",
};

const passwordPattern = {
	value: /^(?=.*[A-Z])(?=.*[a-z]).{6,}$/,
	message: "Debe tener al menos 6 caracteres, una mayúscula y una minúscula",
};

export default function ChangePasswordModal({
	open,
	onCancel,
	onSave,
	isSaving = false,
}: ChangePasswordModalProps) {
	const [formVersion, setFormVersion] = useState(0);

	const handleClose = () => {
		if (isSaving) return;
		setFormVersion((previous) => previous + 1);
		onCancel();
	};

	const handleSubmit = (data: ChangePasswordForm) => {
		if (isSaving) return;
		onSave(data.password);
		setFormVersion((previous) => previous + 1);
	};

	return (
		<VentanaFormulario
			key={formVersion}
			open={open}
			onClose={handleClose}
			onSubmit={handleSubmit}
			titulo="Cambiar contraseña"
			valoresIniciales={defaultForm}
			classNameContenido="flex flex-col gap-4"
			isLoading={isSaving}
		>
			<CampoPassword
				name="password"
				label="Nueva contraseña"
				placeholder="Ingrese la nueva contraseña"
				pattern={passwordPattern}
				disabled={isSaving}
			/>
			<CampoPassword
				name="confirmPassword"
				label="Repetir contraseña"
				placeholder="Repita la nueva contraseña"
				targetName="password"
				disabled={isSaving}
				isConfirm
			/>
		</VentanaFormulario>
	);
}
