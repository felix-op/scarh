"use client";

import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { useMemo, useState } from "react";
import UserInfoCard from "@/components/UserInfoCard";
import UserListCard from "@/components/UserListCard";

  const USUARIO_DEMO = {
  nombre: "Nombre de la persona",
  apellido: "Apellido de la persona",
  legajo: "12345678/123",
  email: "ejemplo123@gmail.com",
  telefono: "+5492901123456",
  password: "secreto-super-seguro",
  estadoLabel: "Activo",
  estadoVariant: "activo" as const,
};

const USUARIOS_LISTA = [
  {
    id: "u1",
    nombre: "Juan Pérez",
    legajo: "123456/01",
    email: "juan.perez@example.com",
    telefono: "+549111111111",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u2",
    nombre: "Ana Gómez",
    legajo: "123456/02",
    email: "ana.gomez@example.com",
    telefono: "+549222222222",
    estadoLabel: "Pendiente",
    estadoVariant: "pendiente" as const,
  },
  {
    id: "u3",
    nombre: "Luis Torres",
    legajo: "123456/03",
    email: "luis.torres@example.com",
    telefono: "+549333333333",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u4",
    nombre: "Carla Méndez",
    legajo: "123456/04",
    email: "carla.mendez@example.com",
    telefono: "+549444444444",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u5",
    nombre: "Diego Romero",
    legajo: "123456/05",
    email: "diego.romero@example.com",
    telefono: "+549555555555",
    estadoLabel: "Suspendido",
    estadoVariant: "suspendido" as const,
  },
  {
    id: "u6",
    nombre: "Marta Silva",
    legajo: "123456/06",
    email: "marta.silva@example.com",
    telefono: "+549666666666",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u7",
    nombre: "Sofía Ruiz",
    legajo: "123456/07",
    email: "sofia.ruiz@example.com",
    telefono: "+549777777777",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u8",
    nombre: "Tomás Herrera",
    legajo: "123456/08",
    email: "tomas.herrera@example.com",
    telefono: "+549888888888",
    estadoLabel: "Inactivo",
    estadoVariant: "inactivo" as const,
  },
  {
    id: "u9",
    nombre: "Lucía Fernández",
    legajo: "123456/09",
    email: "lucia.fernandez@example.com",
    telefono: "+549999999999",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
  {
    id: "u10",
    nombre: "Pedro García",
    legajo: "123456/10",
    email: "pedro.garcia@example.com",
    telefono: "+5491010101010",
    estadoLabel: "Activo",
    estadoVariant: "activo" as const,
  },
];

export default function UsersAdminPage() {
  const [selectedId, setSelectedId] = useState(USUARIOS_LISTA[0]?.id);
  const selectedUser = useMemo(
    () => USUARIOS_LISTA.find((u) => u.id === selectedId) ?? USUARIOS_LISTA[0],
    [selectedId],
  );
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full bg-[#EEF4FB]">
      <Nav
        userName="Juan Perez"
        userEmail="juan.perez@scarh.com"
        onProfileClick={() => router.push("/profile")}
      />

      <main className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="flex w-full max-w-[1620px] flex-col gap-8 xl:flex-row xl:items-start xl:justify-center">
          <UserListCard
            usuarios={USUARIOS_LISTA}
            selectedId={selectedId}
            onSelect={(usuario) => setSelectedId(usuario.id)}
            className="mx-auto"
          />

          <UserInfoCard
            nombre={selectedUser?.nombre ?? ""}
            apellido={selectedUser?.nombre?.split(" ").slice(1).join(" ") || ""}
            legajo={selectedUser?.legajo ?? ""}
            email={selectedUser?.email ?? ""}
            telefono={selectedUser?.telefono ?? ""}
            estadoLabel={selectedUser?.estadoLabel ?? ""}
            estadoVariant={selectedUser?.estadoVariant ?? "activo"}
            password="******************"
            onEdit={() => console.log("Editar usuario")}
            onDelete={() => console.log("Eliminar usuario")}
            className="mx-auto"
          />
        </div>
      </main>
    </div>
  );
}
