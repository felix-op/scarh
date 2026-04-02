"use client";

import BotonBase from "@componentes/botones/BotonBase";
import CampoInput from "@componentes/campos/CampoInput";
import Seccion from "@componentes/secciones/Seccion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type FormValues = {
	password: "";
	confirm_password: "";
};

export default function PasoNuevaPassword() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [exito, setExito] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const form = useForm<FormValues>({
		defaultValues: { password: "", confirm_password: "" }
	});

	const onSubmit = async (data: FormValues) => {
		if (data.password !== data.confirm_password) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		setLoading(true);
		setError(null);
		setExito(null);

		try {
            // El proxy inyecta el token de NextAuth que configuramos al iniciar sesión en el Paso 2
			await axios.post("/api/proxy/auth/recuperar-password/nueva", {
				password: data.password,
			});

			setExito("Contraseña actualizada con éxito. Serás redirigido...");
			
			setTimeout(() => {
				router.push("/");
			}, 2000);
		} catch (err: any) {
			console.error("Error actualizando contraseña:", err);
			const mensaje = err.response?.data?.descripcion_tecnica || "Ocurrió un error al guardar la contraseña.";
			setError(mensaje);
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		router.push("/");
	};

	return (
		<Seccion className="max-w-2xl">
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormProvider {...form}>
					<h2 className="text-3xl font-bold text-[#0982C8] mb-2 text-center">
						Nueva Contraseña
					</h2>
					<p className="text-gray-600 text-sm text-center mb-4">
						Ingresa tu nueva contraseña para aplicarla a la cuenta.
					</p>

					<CampoInput
						label="Nueva Contraseña"
						name="password"
						type={showPassword ? "text" : "password"}
						placeholder="Escribe tu nueva contraseña"
						icon="icon-[mdi--lock-reset] text-gray-600"
						disabled={loading || !!exito}
						endDecorations={[
							{
								className: `${showPassword ? 'icon-[mdi--eye-off]' : 'icon-[mdi--eye]'} text-gray-600 hover:text-gray-800 cursor-pointer`,
								onClick: () => setShowPassword((prev) => !prev)
							}
						]}
						required
					/>

					<CampoInput
						label="Repetir Contraseña"
						name="confirm_password"
						type={showPassword ? "text" : "password"}
						placeholder="Repite la nueva contraseña"
						icon="icon-[mdi--lock-check] text-gray-600"
						disabled={loading || !!exito}
						required
					/>

					{error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
					{exito && <p className="text-green-600 text-sm text-center font-medium">{exito}</p>}

					<BotonBase
						disabled={loading || !!exito}
						type="submit"
						variant="login"
						icon={loading ? "loading" : "none"}
					>Guardar</BotonBase>

					<BotonBase
						disabled={loading || !!exito}
						type="button"
						onClick={onSkip}
						variant="default"
						className="border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
					>Saltar por ahora</BotonBase>
				</FormProvider>
			</form>
		</Seccion>
	);
}
