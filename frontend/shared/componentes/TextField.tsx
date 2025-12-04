"use client";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "email" | "tel";
  className?: string;
};

export function TextField({
	label,
	placeholder = "Placeholder",
	value,
	onChange,
	type = "text",
	className = "",
}: TextFieldProps) {
	return (
		<div
			className={className}
			style={{
				width: "100%",
				minHeight: 81,
				paddingLeft: 11,
				paddingRight: 11,
				paddingTop: 10,
				paddingBottom: 10,
				background: "white",
				boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
				borderRadius: 20,
				display: "flex",
				flexDirection: "column",
				gap: 6,
			}}
		>
			{/* Label */}
			<label
				style={{
					textAlign: "left",
					color: "#838383",
					fontSize: 20,
					fontFamily: "Outfit, sans-serif",
					fontWeight: "400",
					lineHeight: "24px",
				}}
			>
				{label}
			</label>

			{/* Campo editable */}
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				style={{
					width: "100%",
					border: "none",
					outline: "none",
					background: "transparent",
					textAlign: "left",
					color: "black",
					fontSize: 24,
					fontFamily: "Outfit, sans-serif",
					fontWeight: 600,
					lineHeight: "28.8px",
				}}
			/>
		</div>
	);
}
