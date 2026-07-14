"use client";

import { Boton } from "@/components";
import { signOut } from "next-auth/react";

export function ButtonCloseSesion() {
    return (
        <Boton
            icon="cerrar"
            content="Cerrar sesión"
            onClick={() => signOut()}
        />
    )
}