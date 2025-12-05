import { ReactNode } from "react";

type SlidingOutProps = {
    children: ReactNode;
}

export default function SlidingOut({ children }: SlidingOutProps) {
	return (
		<div
			className={`
				absolute left-0 flex items-center
				transition duration-300 ease-in-out
				group-hover:-translate-x-full group-hover:opacity-0
			`}
		>
			{children}
		</div>
	);
}