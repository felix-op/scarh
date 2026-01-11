"use client";

import { ReactNode } from "react";

const baseStyles = {
	nuevo: "bg-nuevo-claro hover:bg-hover active:bg-active text-nuevo",
	exito: "bg-exito-claro hover:bg-hover active:bg-active text-exito",
	error: "bg-error-claro hover:bg-hover active:bg-active text-error",
	default: "bg-default-claro hover:bg-hover active:bg-active text-default",
	principal: "bg-principal hover:bg-principal-claro active:bg-principal-oscuro text-white",
};

const variantConfig	= {
	login: { style: baseStyles.principal, icon: 'icon-[line-md--login]', text: 'Iniciar Sesión' },
	agregar: { style: baseStyles.nuevo, icon: 'icon-[mdi--add]', text: 'Agregar' },
	editar: { style: baseStyles.exito, icon: 'icon-[line-md--edit]', text: 'Editar' },
	eliminar: { style: baseStyles.error, icon: 'icon-[line-md--trash]', text: 'Eliminar' },
	logout: { style: baseStyles.error, icon: 'icon-[line-md--logout]', text: 'Cerrar sesión' },
	ir: { style: baseStyles.default, icon: 'icon-[oui--arrow-right]', text: 'Ver más' },
	filtro: { style: baseStyles.default, icon: 'icon-[mage--filter]', text: 'Filtrar' },
	default: { style: baseStyles.default, icon: '', text: 'Click me!' },
}

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
				relative overflow-hidden flex flex-row items-center justify-center gap-2 shrink-0 
				text-lg rounded-full py-2 px-4 cursor-pointer shadow-md border
				${config.style}

				after:content-[''] after:absolute after:top-0 after:-left-full 
				after:w-1/2 after:h-full after:skew-x-[-25deg]
				after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent
				hover:after:animate-shine

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