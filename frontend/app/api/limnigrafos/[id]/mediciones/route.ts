import { NextResponse } from "next/server";
import { getLimnigrafoStore, saveMediciones } from "@lib/limnigrafoStore";
import type { LimnigrafoMedicion } from "@data/limnigrafos";

type RouteContext = {
	params: { id: string };
};

export async function GET(
	_request: Request,
	{ params }: RouteContext,
) {
	const store = await getLimnigrafoStore();
	return NextResponse.json(store.mediciones[params.id] ?? []);
}

type PostBody = {
	mediciones: LimnigrafoMedicion[];
};

export async function POST(
	request: Request,
	{ params }: RouteContext,
) {
	const payload = (await request.json()) as Partial<PostBody>;
	if (!Array.isArray(payload?.mediciones)) {
		return NextResponse.json(
			{ error: "Debes enviar el arreglo de mediciones." },
			{ status: 400 },
		);
	}

	await saveMediciones(params.id, payload.mediciones);
	return NextResponse.json({ ok: true });
}
