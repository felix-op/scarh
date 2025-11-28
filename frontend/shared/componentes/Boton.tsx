"use client";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: ReactNode;
};

export default function Boton({
	children,
	className = "",
	...props
}: BotonProps) {
	return (
		<button
			{...props}
			className={`
        inline-flex items-center justify-center
        bg-[#0982C8]
        text-[#E7F5FE]
        text-[18px]
        rounded-[20px]
        px-[25px]
        h-[48px]
        hover:bg-[#0A6CA3]
        transition
        mx-auto
        ${className}
      `}
		>
			{children}
		</button>
	);
}
