import { ReactNode } from "react";
import SlidingOut from "./SlidingOut";
import SlidingIn from "./SlidingIn";

type SwapContainerProps = {
    defaultContent: ReactNode;
    hoverContent: ReactNode;
    containerClassName?: string; 
}

export default function SwapContainer({
	defaultContent,
	hoverContent,
	containerClassName = "w-10",
}: SwapContainerProps) {
	return (
		<div className={`
			flex items-center relative h-full
			overflow-hidden
			${containerClassName}
		`}>
			<SlidingOut>
				{defaultContent}
			</SlidingOut>
			
			<SlidingIn>
				{hoverContent}
			</SlidingIn>
		</div>
	);
}