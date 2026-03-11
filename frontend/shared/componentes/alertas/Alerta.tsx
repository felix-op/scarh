import { ReactNode } from "react";

const baseClassNames = {
	exito: "bg-exito-claro border-exito text-exito",
	error: "bg-error-claro border-error text-error",
	info: "bg-info-claro border-info text-info",
	default: "bg-default-claro border-default text-default",
};

const variantConfig = {
	exito: { style: baseClassNames.exito, icon: "icon-[clarity--success-standard-line]" },
	error: { style: baseClassNames.error, icon: "icon-[ix--error]" },
	info: { style: baseClassNames.info, icon: "icon-[material-symbols--info-outline]" },
	default: { style: baseClassNames.default, icon: "" },
};

type VariantKey = keyof typeof variantConfig;

type AlertaProps = {
	variant?: VariantKey;
    className?: string;
    children: ReactNode;
};

export default function Alerta({
	variant = "default",
	className = "",
	children,
}: AlertaProps) {

	return (
		<div className={`flex gap-4 w-full rounded-sm p-4 border-2 shadow-xl ${variantConfig[variant].style} ${className}`}>
			<span className={`text-4xl ${variantConfig[variant].icon}`} />
			{children}
		</div>
	);
}