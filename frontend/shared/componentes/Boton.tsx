"use client";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: ReactNode;
};

export default function Boton({
	children,
	className = "",
	disabled,
	...props
}: BotonProps) {
	return (
		<button
			{...props}
			disabled={disabled}
			className={`
        inline-flex items-center justify-center
        relative overflow-hidden
        bg-[#0982C8]
        text-[#E7F5FE]
        text-[18px]
        rounded-[20px]
        px-[25px]
        h-[48px]
        hover:bg-[#0A6CA3]
        transition-all duration-100
        mx-auto
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:brightness-95 active:brightness-105 active:scale-95"}
        ${disabled ? "" : `
          after:content-[''] after:absolute after:top-0 after:-left-full
          after:w-1/2 after:h-full after:skew-x-[-25deg]
          after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent
          hover:after:animate-shine
          before:content-[''] before:absolute before:inset-0 before:rounded-[20px]
          before:transition-opacity before:duration-100 before:opacity-0
          active:before:opacity-100
          active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)]
        `}
        ${className}
      `}
		>
			{children}
		</button>
	);
}
