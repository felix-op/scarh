import { DetailedHTMLProps, ReactNode, SelectHTMLAttributes } from "react";

type SelectorProps = {
    children: ReactNode;
    error?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
};

export default function Selector({
	children,
	error = false,
	disabled = false,
	isLoading = false,
	...rest
}: DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & SelectorProps) {
	return (
		<div className="relative flex items-center">
			<select
				{...rest}
				className={`
					w-full p-3 px-4 rounded-lg border outline-none  appearance-none transition-colors
					${error ? 'border-red-500' : 'border-border hover:border-foreground focus:border-principal'}
					${disabled || isLoading ? 'bg-campo-input-disabled cursor-not-allowed opacity-70' : 'bg-campo-input cursor-pointer'}
					text-base text-foreground
				`}
			>
				{children}
			</select>

			<div className="absolute right-3 pointer-events-none flex items-center">
				{isLoading ? (
					<span className="animate-spin h-5 w-5 border-2 border-principal border-t-transparent rounded-full" />
				) : (
					<span className="icon-[bx--chevron-down] text-2xl text-gray-400" />
				)}
			</div>
		</div>
	);
}
