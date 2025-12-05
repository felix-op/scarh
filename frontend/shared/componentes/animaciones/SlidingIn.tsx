import { ReactNode } from "react";

type SlidingInProps = {
    children: ReactNode;
}

export default function SlidingIn ({ children }: SlidingInProps) {
	return (
		<div
			className={`
				absolute left-0 flex items-center
				transition duration-300 ease-in-out
				translate-x-full opacity-0
				group-hover:translate-x-0 group-hover:opacity-100
			`}
		>
			{children}
		</div>
	);
}