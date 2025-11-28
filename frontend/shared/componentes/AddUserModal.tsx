"use client";

import { useState } from "react";

export type NewUserData = {
	nombre: string;
	legajo: string;
	email: string;
	telefono: string;
	password: string;
};

type AddUserModalProps = {
	open: boolean;
	onCancel: () => void;
	onSave: (data: NewUserData) => void;
};

const EMPTY_USER: NewUserData = {
	nombre: "",
	legajo: "",
	email: "",
	telefono: "",
	password: "",
};

export default function AddUserModal({
	open,
	onCancel,
	onSave,
}: AddUserModalProps) {
	const [formValues, setFormValues] = useState<NewUserData>(EMPTY_USER);

	function resetForm() {
		setFormValues(EMPTY_USER);
	}

	function handleChange<K extends keyof NewUserData>(key: K, value: string) {
		setFormValues((prev) => ({
			...prev,
			[key]: value,
		}));
	}

	function handleSave() {
		onSave(formValues);
		resetForm();
	}

	function handleCancel() {
		resetForm();
		onCancel();
	}

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="flex w-[976px] max-w-[95vw] flex-col gap-4 rounded-[38px] bg-white p-8 shadow-lg">
				<h2 className="text-center text-3xl font-extrabold text-black drop-shadow">
					Información de Usuario
				</h2>

				<div className="h-px w-full bg-[#E2E2E2]" />

				<div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
					<div className="flex flex-col items-center justify-center gap-6">
						<div className="w-[240px] rounded-3xl bg-white p-4 shadow-md">
							<div className="mb-2 text-center text-2xl font-semibold text-[#032C44]">
								Estado
							</div>
							<div className="flex items-center justify-center gap-3 rounded-full bg-[#F0F0F0]/80 px-6 py-3 shadow">
								<div className="flex h-10 w-10 items-center justify-center rounded-full shadow">
									<div className="h-7 w-7 rounded-full border border-[#0F7810]/40 bg-[#1ED760]" />
								</div>
								<span className="text-lg font-semibold text-black drop-shadow">
									Activo
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-[#E2E2E2] bg-white p-6 shadow-inner">
						<div className="grid gap-5 md:grid-cols-2">
							<div className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow">
								<span className="text-center text-base font-normal text-[#838383]">
									Número de legajo
								</span>
								<input
									className="w-full border-none bg-transparent text-center text-xl font-semibold text-black outline-none"
									placeholder="12345678/123"
									value={formValues.legajo}
									onChange={(event) => handleChange("legajo", event.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow">
								<span className="text-center text-base font-normal text-[#838383]">
									Email
								</span>
								<input
									className="w-full border-none bg-transparent text-center text-xl font-semibold text-black outline-none"
									placeholder="ejemplo123@gmail.com"
									value={formValues.email}
									onChange={(event) => handleChange("email", event.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow">
								<span className="text-center text-base font-normal text-[#838383]">
									Nombre
								</span>
								<input
									className="w-full border-none bg-transparent text-center text-xl font-semibold text-black outline-none"
									placeholder="Nombre de la persona"
									value={formValues.nombre}
									onChange={(event) => handleChange("nombre", event.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow">
								<span className="text-center text-base font-normal text-[#838383]">
									Número de teléfono
								</span>
								<input
									className="w-full border-none bg-transparent text-center text-xl font-semibold text-black outline-none"
									placeholder="+5492901123456"
									value={formValues.telefono}
									onChange={(event) =>
										handleChange("telefono", event.target.value)
									}
								/>
							</div>

							<div className="md:col-span-2 flex flex-col gap-1 rounded-2xl bg-white p-3 shadow">
								<span className="text-center text-base font-normal text-[#838383]">
									Contraseña
								</span>
								<input
									type="password"
									className="w-full border-none bg-transparent text-center text-xl font-semibold text-black outline-none"
									placeholder="******************"
									value={formValues.password}
									onChange={(event) =>
										handleChange("password", event.target.value)
									}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="h-px w-full bg-[#E2E2E2]" />

				<div className="flex items-center justify-center gap-10">
					<button
						type="button"
						onClick={handleCancel}
						className="flex h-12 w-40 items-center justify-center rounded-2xl bg-[#8392A5] text-base font-normal text-[#E7F5FE]"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="flex h-12 w-40 items-center justify-center rounded-2xl bg-[#43BE7E] text-base font-normal text-[#E7F5FE]"
					>
						Guardar
					</button>
				</div>
			</div>
		</div>
	);
}

