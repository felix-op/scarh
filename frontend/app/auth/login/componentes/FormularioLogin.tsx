"use client";

import BotonBase from "@componentes/botones/BotonBase";
import CampoInput from "@componentes/campos/CampoInput";
import Seccion from "@componentes/secciones/Seccion";
import LoginCredentials from "@tipos/LoginCredentials";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type FormularioLoginProps = {
    onSubmit: (credentials: LoginCredentials) => void;
    loading	: boolean;
    error: Error | null;
};

export default function FormularioLogin({onSubmit, loading, error}: FormularioLoginProps) {
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginCredentials>({
		defaultValues: {
			username: "",
			password: "",
		}
	});

	return (
		<Seccion className="max-w-2xl">
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormProvider {...form}>
					<h2 className="text-4xl font-bold text-[#0982C8]">SCARH</h2>
					<CampoInput
						label="Nombre de usuario"
						name="username"
						type="text"
						placeholder="Ingrese su nombre de usuario"
						icon="icon-[mdi--user] text-gray-600"
						disabled={loading}
						required
					/>
					<CampoInput
						label="Contraseña"
						name="password"
						type={showPassword ? "text" : "password"}
						placeholder="Ingrese su contraseña"
						icon="icon-[mdi--lock] text-gray-600"
						disabled={loading}
						endDecorations={[
							{
								className: `${showPassword ? 'icon-[mdi--eye-off]' : 'icon-[mdi--eye]'} text-gray-600 hover:text-gray-800 cursor-pointer`,
								onClick: () => setShowPassword((prev) => !prev)
							}
						]}
						required
					/>
					{error && <p className="text-red-500">{error.message}</p>}
					<BotonBase
						disabled={loading}
						variant="login"
						type="submit"
						icon={loading ? "loading": "none"}
					/>
				</FormProvider>
			</form>
		</Seccion>
	);
}