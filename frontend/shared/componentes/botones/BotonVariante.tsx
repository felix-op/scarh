"use client";

import { ReactNode } from "react";

const baseStyles = {
	nuevo: "bg-nuevo-claro hover:bg-hover active:bg-active text-nuevo",
	exito: "bg-exito-claro hover:bg-hover active:bg-active text-exito",
	error: "bg-error-claro hover:bg-hover active:bg-active text-error",
	default: "bg-default-claro hover:bg-hover active:bg-active text-default",
	principal: "bg-principal hover:bg-principal-claro active:bg-principal-oscuro text-white",
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
	// Estética de los botones de perfil (ProfileActionButton)
	perfilEditar: {
		style: "bg-[var(--nuevo-claro)] text-[var(--principal)] border border-[var(--principal)]",
		icon: "icon-[mdi--pencil]",
		text: "Editar mis datos",
		customClass:
			"h-12 px-6 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-2.5 font-outfit text-2xl font-normal whitespace-nowrap transition hover:brightness-95 active:scale-[0.99]",
		disableShine: true,
	},
	perfilPassword: {
		style: "bg-[var(--nuevo-claro)] text-[var(--principal)] border border-[var(--principal)]",
		icon: "icon-[solar--lock-password-bold]",
		text: "Cambiar contraseña",
		customClass:
			"h-12 px-6 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-2.5 font-outfit text-2xl font-normal whitespace-nowrap transition hover:brightness-95 active:scale-[0.99]",
		disableShine: true,
	},
	perfilLogout: {
		style: "bg-[var(--error-claro)] text-[var(--error)] border border-[var(--error)]",
		icon: "icon-[fluent--arrow-exit-20-regular]",
		text: "Cerrar sesión",
		customClass:
			"h-12 px-6 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-2.5 font-outfit text-2xl font-normal whitespace-nowrap transition hover:brightness-95 active:scale-[0.99]",
		disableShine: true,
	},
	default: { style: baseStyles.default, icon: "", text: "Click me!" },
} as const satisfies Record<string, VariantConfig>;

const baseButtonClass = `
	relative overflow-hidden flex flex-row items-center justify-center gap-2 shrink-0 
	text-lg rounded-full py-2 px-4 cursor-pointer shadow-md border
`;

const shineEffectClass = `
	after:content-[''] after:absolute after:top-0 after:-left-full 
	after:w-1/2 after:h-full after:skew-x-[-25deg]
	after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent
	hover:after:animate-shine
`;

const buttonStyle = {
	boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
};

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
			style={buttonStyle}
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
