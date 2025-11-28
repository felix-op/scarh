"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Nav } from "@componentes/Nav";
import UserInfoCard from "@componentes/UserInfoCard";
import UserListCard from "@componentes/UserListCard";
import { TextField } from "@componentes/TextField";
import Boton from "@componentes/Boton";
import AddUserModal, { NewUserData } from "@componentes/AddUserModal";

type EstadoVariant = "activo" | "inactivo" | "pendiente" | "suspendido";

type Usuario = {
	id: string;
	nombre: string;
	legajo: string;
	email: string;
	telefono: string;
	estadoLabel: string;
	estadoVariant: EstadoVariant;
};

const USUARIOS_LISTA: Usuario[] = [
	{
		id: "u1",
		nombre: "Juan Pérez",
		legajo: "123456/01",
		email: "juan.perez@example.com",
		telefono: "+549111111111",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u2",
		nombre: "Ana Gómez",
		legajo: "123456/02",
		email: "ana.gomez@example.com",
		telefono: "+549222222222",
		estadoLabel: "Pendiente",
		estadoVariant: "pendiente",
	},
	{
		id: "u3",
		nombre: "Luis Torres",
		legajo: "123456/03",
		email: "luis.torres@example.com",
		telefono: "+549333333333",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u4",
		nombre: "Carla Méndez",
		legajo: "123456/04",
		email: "carla.mendez@example.com",
		telefono: "+549444444444",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u5",
		nombre: "Diego Romero",
		legajo: "123456/05",
		email: "diego.romero@example.com",
		telefono: "+549555555555",
		estadoLabel: "Suspendido",
		estadoVariant: "suspendido",
	},
	{
		id: "u6",
		nombre: "Marta Silva",
		legajo: "123456/06",
		email: "marta.silva@example.com",
		telefono: "+549666666666",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u7",
		nombre: "Sofía Ruiz",
		legajo: "123456/07",
		email: "sofia.ruiz@example.com",
		telefono: "+549777777777",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u8",
		nombre: "Tomás Herrera",
		legajo: "123456/08",
		email: "tomas.herrera@example.com",
		telefono: "+549888888888",
		estadoLabel: "Inactivo",
		estadoVariant: "inactivo",
	},
	{
		id: "u9",
		nombre: "Lucía Fernández",
		legajo: "123456/09",
		email: "lucia.fernandez@example.com",
		telefono: "+549999999999",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
	{
		id: "u10",
		nombre: "Pedro García",
		legajo: "123456/10",
		email: "pedro.garcia@example.com",
		telefono: "+5491010101010",
		estadoLabel: "Activo",
		estadoVariant: "activo",
	},
];

export default function UsersAdminPage() {
	const router = useRouter();

	const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_LISTA);
	const [selectedId, setSelectedId] = useState<string | undefined>(
		USUARIOS_LISTA[0]?.id,
	);

	const selectedUser = useMemo(
		() => usuarios.find((u) => u.id === selectedId),
		[usuarios, selectedId],
	);

	// --- Modal edición ---
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editNombre, setEditNombre] = useState("");
	const [editLegajo, setEditLegajo] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editTelefono, setEditTelefono] = useState("");

	// --- Modal eliminar ---
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);

	function handleOpenEdit() {
		if (!selectedUser) return;
		setEditNombre(selectedUser.nombre);
		setEditLegajo(selectedUser.legajo);
		setEditEmail(selectedUser.email);
		setEditTelefono(selectedUser.telefono);
		setIsEditOpen(true);
	}

	function handleSaveEdit() {
		if (!selectedUser) return;

		setUsuarios((prev) =>
			prev.map((u) =>
				u.id === selectedUser.id
					? {
						...u,
						nombre: editNombre,
						legajo: editLegajo,
						email: editEmail,
						telefono: editTelefono,
					}
					: u,
			),
		);

		setIsEditOpen(false);
	}

	function handleCancelEdit() {
		setIsEditOpen(false);
	}

	function handleOpenDelete() {
		if (!selectedUser) return;
		setIsDeleteOpen(true);
	}

	function handleConfirmDelete() {
		if (!selectedUser) return;

		setUsuarios((prev) => {
			const nuevaLista = prev.filter((u) => u.id !== selectedUser.id);

			if (nuevaLista.length === 0) {
				setSelectedId(undefined);
			} else if (!nuevaLista.some((u) => u.id === selectedId)) {
				setSelectedId(nuevaLista[0].id);
			}

			return nuevaLista;
		});

		setIsDeleteOpen(false);
	}

	function handleCancelDelete() {
		setIsDeleteOpen(false);
	}

	function handleOpenAdd() {
		setIsAddOpen(true);
	}

	function handleCancelAdd() {
		setIsAddOpen(false);
	}

	function handleSaveAdd(data: NewUserData) {
		if (!data.nombre.trim() || !data.legajo.trim() || !data.email.trim()) {
			alert("Completá al menos nombre, legajo y email.");
			return;
		}

		const newUser: Usuario = {
			id: `u${Date.now()}`,
			nombre: data.nombre,
			legajo: data.legajo,
			email: data.email,
			telefono: data.telefono,
			estadoLabel: "Activo",
			estadoVariant: "activo",
		};

		setUsuarios((prev) => [...prev, newUser]);
		setSelectedId(newUser.id);

		console.log("Nuevo usuario creado:", {
			...newUser,
			password: data.password,
		});

		setIsAddOpen(false);
	}

	return (
		<div className="flex min-h-screen w-full bg-[#EEF4FB]">
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => router.push("/perfil")}
			/>

			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1350px] flex-col gap-8">
					<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col gap-1">
							<h1 className="text-2xl font-semibold text-[#1E293B]">
								Administración de usuarios
							</h1>
							<p className="text-sm text-[#6B7280]">
								Seleccioná un usuario de la lista para ver o editar su
								información, o añadí uno nuevo.
							</p>
						</div>

						<Boton type="button" onClick={handleOpenAdd}>
							Añadir usuario
						</Boton>
					</header>

					<div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
						<UserListCard
							usuarios={usuarios}
							selectedId={selectedId}
							onSelect={(usuario) => setSelectedId(usuario.id)}
							className="mx-auto"
						/>

						<UserInfoCard
							nombre={selectedUser?.nombre ?? ""}
							apellido={
								selectedUser?.nombre?.split(" ").slice(1).join(" ") || ""
							}
							legajo={selectedUser?.legajo ?? ""}
							email={selectedUser?.email ?? ""}
							telefono={selectedUser?.telefono ?? ""}
							estadoLabel={selectedUser?.estadoLabel ?? ""}
							estadoVariant={selectedUser?.estadoVariant ?? "activo"}
							password="******************"
							onEdit={handleOpenEdit}
							onDelete={handleOpenDelete}
							className="mx-auto"
						/>
					</div>
				</div>
			</main>

			{/* Modal edición */}
			{isEditOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-[560px] rounded-3xl bg-white p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.25)]">
						<h2 className="mb-6 text-xl font-semibold text-[#1E293B]">
							Editar usuario
						</h2>

						<div className="mb-6 flex flex-col gap-4">
							<TextField
								label="Nombre y apellido"
								placeholder="Nombre completo"
								value={editNombre}
								onChange={setEditNombre}
							/>
							<TextField
								label="Legajo"
								placeholder="123456/01"
								value={editLegajo}
								onChange={setEditLegajo}
							/>
							<TextField
								label="Email"
								placeholder="usuario@scarh.com"
								value={editEmail}
								onChange={setEditEmail}
							/>
							<TextField
								label="Teléfono"
								placeholder="+549..."
								value={editTelefono}
								onChange={setEditTelefono}
							/>
						</div>

						<div className="flex flex-wrap justify-center gap-4">
							<Boton type="button" onClick={handleSaveEdit}>
								Guardar cambios
							</Boton>
							<Boton
								type="button"
								className="!bg-white !text-[#0D76B3] !border !border-[#0D76B3]"
								onClick={handleCancelEdit}
							>
								Cancelar
							</Boton>
						</div>
					</div>
				</div>
			)}

			{/* Modal eliminar */}
			{isDeleteOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-[480px] rounded-3xl bg-white p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.25)]">
						<h2 className="mb-4 text-xl font-semibold text-[#1E293B]">
							Eliminar usuario
						</h2>
						<p className="mb-6 text-sm text-[#4B5563]">
							¿Seguro que querés eliminar la cuenta de{" "}
							<span className="font-semibold">
								{selectedUser?.nombre ?? "este usuario"}
							</span>
							? Esta acción no se puede deshacer (por ahora en esta pantalla
							sólo se elimina de la lista local).
						</p>

						<div className="flex flex-wrap justify-center gap-4">
							<Boton
								type="button"
								className="!bg-[#DC2626] !text-white hover:!bg-[#B91C1C]"
								onClick={handleConfirmDelete}
							>
								Eliminar
							</Boton>
							<Boton
								type="button"
								className="!bg-white !text-[#0D76B3] !border !border-[#0D76B3]"
								onClick={handleCancelDelete}
							>
								Cancelar
							</Boton>
						</div>
					</div>
				</div>
			)}

			{/* Modal añadir */}
			<AddUserModal
				open={isAddOpen}
				onCancel={handleCancelAdd}
				onSave={handleSaveAdd}
			/>
		</div>
	);
}
