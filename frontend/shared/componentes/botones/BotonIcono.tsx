import { MouseEventHandler } from "react";

type BotonIconoProps = {
    icono: string,
    className?: string,
	onClick?: MouseEventHandler,
};

export default function BotonIcono({
	icono,
	className = "",
	onClick
}: BotonIconoProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`relative cursor-pointer overflow-hidden rounded-md border-b-4 border-transparent transition-all duration-100 hover:brightness-95 active:scale-95 active:brightness-110 after:pointer-events-none after:absolute after:top-0 after:-left-full after:h-full after:w-1/2 after:skew-x-[-25deg] after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent hover:after:animate-shine before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-100 active:before:opacity-100 active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)] ${className}`}
		>
			<span className={`relative z-10 text-3xl ${icono}`} />
		</button>
	);
}
