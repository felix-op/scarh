"use client";

import { ReactNode } from "react";

const baseStyles = {
	nuevo: "bg-nuevo-claro text-nuevo",
	exito: "bg-exito-claro text-exito",
	error: "bg-error-claro text-error",
	default: "bg-default-claro text-default",
	principal: "bg-principal text-white",
};

type VariantConfig = {
	style: string;
	icon: string;
	text: string;
	customClass?: string;
	disableShine?: boolean;
};

const variantConfig: Record<string, VariantConfig> = {
	login: { style: baseStyles.principal, icon: "icon-[line-md--login]", text: "Iniciar Sesión" },
	agregar: { style: baseStyles.nuevo, icon: "icon-[mdi--add]", text: "Agregar" },
	editar: { style: baseStyles.exito, icon: "icon-[line-md--edit]", text: "Editar" },
	eliminar: { style: baseStyles.error, icon: "icon-[line-md--trash]", text: "Eliminar" },
	logout: { style: baseStyles.error, icon: "icon-[line-md--logout]", text: "Cerrar sesión" },
	ir: { style: baseStyles.default, icon: "icon-[oui--arrow-right]", text: "Ver más" },
	filtro: { style: baseStyles.default, icon: "icon-[mage--filter]", text: "Filtrar" },
	perfilEditar: { style: baseStyles.exito, icon: "icon-[mdi--pencil]", text: "Editar mis datos" },
	perfilPassword: { style: baseStyles.nuevo, icon: "icon-[solar--lock-password-bold]", text: "Cambiar contraseña" },
	perfilLogout: { style: baseStyles.error, icon: "icon-[fluent--arrow-exit-20-regular]", text: "Cerrar sesión" },
	default: { style: baseStyles.default, icon: "", text: "Click me!" },
} as const satisfies Record<string, VariantConfig>;

const baseButtonClass = `
	relative overflow-hidden flex flex-row items-center justify-center gap-2 shrink-0
	text-lg rounded-full py-2 px-4 cursor-pointer shadow-md border hover:brightness-95
	transition-all duration-100 select-none 
	shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
	active:brightness-105 active:scale-95 
`;

const shineEffectClass = `
	after:content-[''] after:absolute after:top-0 after:-left-full 
	after:w-1/2 after:h-full after:skew-x-[-25deg]
	after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent
	hover:after:animate-shine
	active:shadow-inner whitespace-nowrap 
	before:content-[''] before:absolute before:inset-0 before:rounded-full
    before:transition-opacity before:duration-100 before:opacity-0
    active:before:opacity-100 
    active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)]
`;

type VariantKey = keyof typeof variantConfig;

type BotonVarianteProps = {
    children?: ReactNode;
    onClick?: () => void;
	loading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: VariantKey;
};

export default function BotonVariante({
	children,
	onClick,
	loading = false,
	disabled = false,
	className = '',
	type = 'button',
	variant = 'default',
}: BotonVarianteProps) {

	const config = variantConfig[variant];

	return (
		<button
			className={`
				${config.customClass ?? baseButtonClass}
				${config.style}
				${config.disableShine ? '' : shineEffectClass}
				${className}
			`}
			onClick={onClick}
			disabled={disabled}
			type={type}
		>
			{children || (
				<>
					<span className={`text-2xl ${loading ? 'icon-[line-md--loading-twotone-loop]' : config.icon}`} />
					<span>{config.text}</span>
				</>
			)}
		</button>
	);
}
