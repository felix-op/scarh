"use client";

import { ReactNode } from "react";

type BotonBaseProps = {
    children?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'login' | 'none' | 'default';
	icon?: 'loading' | 'none',
};

export default function BotonBase({
	icon = 'none',
	children,
	onClick,
	disabled = false,
	className = '',
	type = 'button',
	variant = 'default',
}: BotonBaseProps) {
	const variantClass = {
		login: 'bg-[#0982C8] hover:bg-[#0A6CA3] text-[#E7F5FE] text-xl rounded-2xl p-2',
		none: '',
		default: 'bg-white text-primary',
	};

	const textVariant = {
		login: 'Iniciar Sesión',
		none: '',
		default: 'Click me!',
	};

	const iconVariant = {
		login: 'login',
		loading: 'icon-[line-md--loading-twotone-loop]',
		none: '',
		default: '',
	};

	return (
		<button
			className={
				"flex flex-row items-center justify-center gap-2 cursor-pointer " +
				variantClass[variant ?? "default"] +
				" " + className
			}
			onClick={onClick}
			disabled={disabled}
			type={type}
		>
			<span className={iconVariant[icon ?? variant]} />
			{children || textVariant[variant]}
		</button>
	);
}