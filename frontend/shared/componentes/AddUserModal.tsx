"use client";

import { useState } from "react";

export type NewUserData = {
	nombre: string;   // first name
	apellido: string; // last name
	username: string;
	legajo: string;   // decorativo
	email: string;
	password: string;
};

type AddUserModalProps = {
	open: boolean;
	onCancel: () => void;
	onSave: (data: NewUserData) => void;
	isSaving?: boolean;
};

const EMPTY_USER: NewUserData = {
	nombre: "",
	apellido: "",
	username: "",
	legajo: "",
	email: "",
	password: "",
};

export default function AddUserModal({
	open,
	onCancel,
	onSave,
	isSaving = false,
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
		if (isSaving) return;
		onSave(formValues);
		resetForm();
	}

	function handleCancel() {
		if (isSaving) return;
		resetForm();
		onCancel();
	}

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true">
			<div className="absolute inset-y-0 right-0 flex h-full w-full sm:max-w-xl">
				<div className="flex h-full w-full flex-col bg-white shadow-[-10px_0_28px_rgba(0,0,0,0.2)]">
					<div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
						<div>
							<h2 className="text-xl font-semibold text-[#111827]">Nuevo usuario</h2>
						</div>
						<button
							onClick={handleCancel}
							className="text-2xl text-[#9CA3AF] hover:text-[#4B5563]"
							aria-label="Cerrar"
							disabled={isSaving}
						>
							×
						</button>
					</div>

					<div className="flex-1 overflow-y-auto px-6 py-5">
						<div className="grid grid-cols-1 gap-4">
							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Nombre</span>
								<input
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="Nombre"
									value={formValues.nombre}
									onChange={(event) => handleChange("nombre", event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Apellido</span>
								<input
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="Apellido"
									value={formValues.apellido}
									onChange={(event) => handleChange("apellido", event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Username</span>
								<input
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="usuario1"
									value={formValues.username}
									onChange={(event) => handleChange("username", event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Legajo </span>
								<input
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="123456/01"
									value={formValues.legajo}
									onChange={(event) => handleChange("legajo", event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Email</span>
								<input
									type="email"
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="usuario@mail.com"
									value={formValues.email}
									onChange={(event) => handleChange("email", event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Contraseña</span>
								<input
									type="password"
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="********"
									value={formValues.password}
									onChange={(event) => handleChange("password", event.target.value)}
									disabled={isSaving}
								/>
							</label>
						</div>
					</div>

					<div className="flex shrink-0 justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
						<button
							type="button"
							onClick={handleCancel}
							className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
							disabled={isSaving}
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="rounded-lg bg-[#0D76B3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b679b] disabled:cursor-not-allowed disabled:opacity-70"
							disabled={isSaving}
						>
							{isSaving ? "Guardando..." : "Guardar"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
