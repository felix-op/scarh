import { NextResponse } from "next/server";
import {
	addLimnigrafo,
	getLimnigrafoStore,
	removeLimnigrafo,
} from "@lib/limnigrafoStore";
import type { LimnigrafoDetalleData } from "@data/limnigrafos";

export async function GET() {
	const store = await getLimnigrafoStore();
	return NextResponse.json(store);
}

type PostBody = {
	limnigrafo: LimnigrafoDetalleData;
};

export async function POST(request: Request) {
	const payload = (await request.json()) as Partial<PostBody>;
	if (!payload?.limnigrafo) {
		return NextResponse.json(
			{ error: "Falta el objeto limnigrafo en la peticion." },
			{ status: 400 },
		);
	}

	await addLimnigrafo(payload.limnigrafo);
	return NextResponse.json({ ok: true });
}

type DeleteBody = {
	id: string;
};

export async function DELETE(request: Request) {
	const payload = (await request.json()) as Partial<DeleteBody>;
	if (!payload?.id) {
		return NextResponse.json(
			{ error: "Falta el identificador del limnigrafo." },
			{ status: 400 },
		);
	}

	await removeLimnigrafo(payload.id);
	return NextResponse.json({ ok: true });
}
