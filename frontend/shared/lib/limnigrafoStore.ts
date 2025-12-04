import { promises as fs } from "fs";
import path from "path";
import {
	type LimnigrafoDetalleData,
	type LimnigrafoMedicion,
	LIMNIGRAFOS,
} from "@data/limnigrafos";

export type LimnigrafoStore = {
	limnigrafos: LimnigrafoDetalleData[];
	mediciones: Record<string, LimnigrafoMedicion[]>;
};

const STORE_PATH = path.join(
	process.cwd(),
	"shared",
	"data",
	"limnigrafosStore.json",
);

async function readRawStore(): Promise<LimnigrafoStore | null> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		return JSON.parse(raw) as LimnigrafoStore;
	} catch {
		return null;
	}
}

async function writeStore(data: LimnigrafoStore) {
	await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
	await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
	return data;
}

function normalizeStore(store: LimnigrafoStore | null): LimnigrafoStore {
	if (!store) {
		return {
			limnigrafos: [...LIMNIGRAFOS],
			mediciones: {},
		};
	}

	return {
		limnigrafos: Array.isArray(store.limnigrafos)
			? store.limnigrafos
			: [...LIMNIGRAFOS],
		mediciones: store.mediciones ?? {},
	};
}

export async function getLimnigrafoStore() {
	const store = normalizeStore(await readRawStore());
	if (!store.limnigrafos.length) {
		store.limnigrafos = [...LIMNIGRAFOS];
		await writeStore(store);
	}
	return store;
}

export async function saveLimnigrafoStore(nextStore: LimnigrafoStore) {
	return writeStore(normalizeStore(nextStore));
}

export async function addLimnigrafo(limnigrafo: LimnigrafoDetalleData) {
	const store = await getLimnigrafoStore();
	store.limnigrafos = [
		limnigrafo,
		...store.limnigrafos.filter((item) => item.id !== limnigrafo.id),
	];
	return writeStore(store);
}

export async function removeLimnigrafo(id: string) {
	const store = await getLimnigrafoStore();
	store.limnigrafos = store.limnigrafos.filter((item) => item.id !== id);
	delete store.mediciones[id];
	return writeStore(store);
}

export async function saveMediciones(
	limnigrafoId: string,
	mediciones: LimnigrafoMedicion[],
) {
	const store = await getLimnigrafoStore();
	store.mediciones[limnigrafoId] = mediciones;
	return writeStore(store);
}
