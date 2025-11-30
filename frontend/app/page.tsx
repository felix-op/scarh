"use client";

import { redirect } from "next/navigation";


export default function PaginaInicio() {
	redirect('/auth/login');
}
