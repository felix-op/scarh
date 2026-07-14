"use client";

import { useRouter } from "next/navigation";
import { Boton } from "@components";

export function BotonVolverInicio() {
  const router = useRouter();
  return <Boton content="Volver al inicio" variant="primary" icon="volver" onClick={() => router.push("/dashboard")} />;
}
