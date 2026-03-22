import { ReactNode } from "react";

type SeccionInfoDataProps = {
	label: string;
	children: ReactNode;
	dir?: "row" | "column";
};

export default function SeccionInfoData({
	label,
	children,
	dir = "row",
}: SeccionInfoDataProps) {
	const isColumn = dir === "column";

	return (
		<div className="flex min-w-0 gap-2 rounded-2xl px-3" style={{ flexDirection: dir, alignItems: isColumn ? "flex-start" : "center" }}>
			<div className="shrink-0 whitespace-nowrap text-left text-[20px] font-normal leading-6">
				{label}
			</div>
			<div className="min-w-0 text-[24px] font-semibold text-foreground leading-[28px] wrap-break-word">
				{children}
			</div>
		</div>
	);
}
