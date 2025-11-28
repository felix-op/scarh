"use client";

import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import UserInfoCard from "@/components/UserInfoCard";

const USUARIO_DEMO = {
  nombre: "Juan",
  apellido: "Perez",
  legajo: "12345678/123",
  email: "juanp123@gmail.com",
  telefono: "+5492901123456",
  password: "juancito123",
  estadoLabel: "Activo",
  estadoVariant: "activo" as const,
};

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full bg-[#EEF4FB]">
      <Nav
        userName="Juan Perez"
        userEmail="juan.perez@scarh.com"
        onProfileClick={() => router.push("/profile")}
      />

      <main className="flex flex-1 items-start justify-center px-6 py-10">
        <UserInfoCard
          {...USUARIO_DEMO}
          showActions={false}
          showPassword={false}
          className="mx-auto"
        />
      </main>
    </div>
  );
}
