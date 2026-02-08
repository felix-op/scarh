"use client";

import { useState } from "react";

type ChangePasswordModalProps = {
	open: boolean;
	onCancel: () => void;
	onSave: (password: string) => void;
	isSaving?: boolean;
};

export default function ChangePasswordModal({
	open,
	onCancel,
	onSave,
	isSaving = false,
}: ChangePasswordModalProps) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	function resetForm() {
		setPassword("");
		setConfirmPassword("");
		setError("");
	}

	function validatePassword(value: string) {
		if (value.length < 6) {
			return "La contraseña debe tener al menos 6 caracteres.";
		}
		if (!/[A-Z]/.test(value)) {
			return "La contraseña debe incluir al menos una letra mayúscula.";
		}
		if (!/[a-z]/.test(value)) {
			return "La contraseña debe incluir al menos una letra minúscula.";
		}
		return "";
	}

	function handleSave() {
		if (isSaving) return;
		const validationError = validatePassword(password);
		if (validationError) {
			setError(validationError);
			return;
		}
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		setError("");
		onSave(password);
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
						<h2 className="text-xl font-semibold text-[#111827]">Cambiar contraseña</h2>
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
								<span className="text-sm font-medium text-[#374151]">Nueva contraseña</span>
								<input
									type="password"
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="********"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-sm font-medium text-[#374151]">Repetir contraseña</span>
								<input
									type="password"
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
									placeholder="********"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									disabled={isSaving}
								/>
							</label>

							<p className="text-xs text-[#6B7280]">
								La contraseña debe tener al menos 6 caracteres, una mayúscula y una minúscula.
							</p>

							{error && (
								<p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">
									{error}
								</p>
							)}
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
