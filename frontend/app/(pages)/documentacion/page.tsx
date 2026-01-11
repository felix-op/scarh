import PaginaBase from "@componentes/base/PaginaBase";
import IndiceCard from "./componentes/IndiceCard";
import TituloDoc from "./componentes/TituloDoc";
import IndiceItem from "./componentes/IndiceItem";
import { ReactElement } from "react";
import DocumentoPersistedState from "./documentos/DocumentoPersistedState";
import DocumentoIsMounted from "./documentos/DocumentoIsMounted";
import DocumentoBotonVariante from "./documentos/DocumentoBotonVariante";

type TIndiceCard = {
	href: string,
	icon: string,
	label: string,
	newPage?: boolean,
}

type TIndiceItem = {
	href: string,
	label: string,
	documento: () => ReactElement
}

type TIndice = {
	especifica: TIndiceCard[],
	librerias: TIndiceCard[],
	componentes: TIndiceItem[],
	hooks: TIndiceItem[],
}

export default function Documentacion() {
	const indice: TIndice = {
		especifica: [
			{href: "#componentes", icon: "icon-[mdi--cube-outline]", label: "Componentes"},
			{href: "#hooks", icon: "icon-[tabler--fish-hook]", label: "Hooks"},
			{href: "#utilidades", icon: "icon-[carbon--tool-kit]", label: "Utilidades"},
			{href: "", icon: "icon-[mingcute--drive-line]", label: "Del Proyecto", newPage: true},
		],
		librerias: [
			{href: "https://es.react.dev/reference/react", icon: "icon-[mdi--react]", label: "React", newPage: true},
			{href: "https://nextjs.org/docs", icon: "icon-[nonicons--next-16]", label: "Next", newPage: true},
			{href: "https://javascript.info/", icon: "icon-[ri--javascript-line]", label: "JavaScript", newPage: true},
			{href: "https://icon-sets.iconify.design/", icon: "icon-[simple-icons--iconify]", label: "Iconify", newPage: true},
			{href: "https://tailwindcss.com/docs/installation/using-vite", icon: "icon-[mdi--tailwind]", label: "TailwindCSS", newPage: true},
			{href: "https://tanstack.com/query/latest/docs/framework/react/overview", icon: "icon-[streamline-plump--beach]", label: "TanStack Query", newPage: true},
			{href: "https://ui.shadcn.com/docs/components", icon: "icon-[simple-icons--shadcnui]", label: "Shadcn", newPage: true},
		],
		componentes: [
			{href: "componente-botonvariante", label: "BotonVariante", documento: DocumentoBotonVariante},
		],
		hooks: [
			{href: "hook-persistedstate", label: "usePersistedState", documento: DocumentoPersistedState},
			{href: "hook-ismounted", label: "useIsMounted", documento: DocumentoIsMounted},
		],
	}

	return (
		<PaginaBase flex>
			<h2>Documentación</h2>

			<TituloDoc>Específica</TituloDoc>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{indice.especifica.map((doc) => {
					const {href, icon, label, newPage} = doc;
					return (
						<IndiceCard key={href} href={href} icon={icon} newPage={newPage}>
							{label}
						</IndiceCard>
					)
				})}
			</div>

			<TituloDoc>Librerías</TituloDoc>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{indice.librerias.map((doc) => {
					const {href, icon, label, newPage} = doc;
					return (
						<IndiceCard key={href} href={href} icon={icon} newPage={newPage}>
							{label}
						</IndiceCard>
					)
				})}
			</div>

			<TituloDoc id="componentes">Componentes</TituloDoc>
			<div className="flex flex-wrap gap-4">
				{indice.componentes.map((doc) => {
					const {href, label} = doc;
					return (
						<IndiceItem key={href} href={`#${href}`}>
							{label}
						</IndiceItem>
					)
				})}
			</div>
			<br />
			<div className="flex flex-col">
				{indice.componentes.map((doc) => {
					const {href, documento: Documento} = doc;
					return (
						<Documento key={`doc-${href}`} />
					)
				})}
			</div>

			<TituloDoc id="hooks">Hooks</TituloDoc>
			<div className="flex flex-wrap gap-4">
				{indice.hooks.map((doc) => {
					const {href, label} = doc;
					return (
						<IndiceItem key={href} href={`#${href}`}>
							{label}
						</IndiceItem>
					)
				})}
			</div>
			<br />
			<div className="flex flex-col">
				{indice.hooks.map((doc) => {
					const {href, documento: Documento} = doc;
					return (
						<Documento key={`doc-${href}`} />
					)
				})}
			</div>
				

			<TituloDoc id="utilidades">Utilidades</TituloDoc>


		</PaginaBase>
	);
}