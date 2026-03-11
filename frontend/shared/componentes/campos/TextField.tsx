import { InputProps } from "types/campos";

export type TextFieldProps = {
	icon?: string;
	error?: boolean;
	disabled?: boolean;
	isLoading?: boolean;
	endDecoration?: {
		className: string;
		onClick?: () => void;
	};
};

export default function TextField({
	icon,
	error = false,
	endDecoration,
	disabled = false,
	isLoading = false,
	...rest
}: InputProps & TextFieldProps) {
	return (
		<div className="relative flex flex-row items-center">
			<span className={`absolute left-3 text-2xl ${icon}`} />
			<input
				{...rest}
				className={`
					w-full p-3 px-4 text-base text-foreground
					rounded-lg border-2 outline-none
					${!!icon ? 'pl-10' : ''}
					${isLoading || disabled ? 'bg-campo-input-disabled cursor-not-allowed' : 'bg-campo-input'}
					${error ? 'border-red-500' : 'border-border hover:border-foreground focus:border-principal'}
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
