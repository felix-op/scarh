import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type TextFieldProps = {
	icon?: string;
	disabled?: boolean;
	isLoading?: boolean;
	endDecoration?: {
		className: string;
		onClick?: () => void;
	};
};

export default function TextField({
	icon,
	endDecoration,
	disabled = false,
	isLoading = false,
}: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & TextFieldProps) {
	return (
		<div className="relative flex flex-row items-center">
			<span className={`absolute left-3 text-2xl ${icon}`} />
			<input
				className={`
					w-full p-3 px-4 text-base text-foreground
					rounded-lg border border-border outline-none
					${!!icon ? 'pl-10' : ''}
					${isLoading || disabled ? 'bg-campo-input-disabled cursor-not-allowed' : 'bg-campo-input'}
					${endDecoration ? 'pr-10' : ''}
				`}
			/>

			{isLoading && (
				<span className="loading-spinner">Cargando...</span>
			)}

			{endDecoration && (
				<span
					className={`absolute right-3 text-2xl ${endDecoration.className}`}
					onClick={endDecoration.onClick}
				/>
			)}
		</div>
	);
}