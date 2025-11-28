"use client";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextField({
	label,
	placeholder = "Placeholder",
	value,
	onChange,
}: TextFieldProps) {
	return (
		<div
			style={{
				width: 283,
				height: 81,
				paddingLeft: 11,
				paddingRight: 11,
				paddingTop: 10,
				paddingBottom: 10,
				background: "white",
				boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
				overflow: "hidden",
				borderRadius: 20,
				display: "inline-flex",
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "flex-start",
			}}
		>
			{/* Label */}
			<label
				style={{
					textAlign: "center",
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
				type="text"
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
