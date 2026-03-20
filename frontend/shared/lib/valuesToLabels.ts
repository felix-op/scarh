type Option = {
	label: string;
	value: string;
};

export const valuesToLabels = (
	values?: string[] | null,
	options: Option[] = [],
	fallback = "-",
): string => {
	if (!values?.length) return fallback;

	const labels = values
		.map((value) => {
			const match = options.find((opt) => opt.value === value);
			return match?.label;
		})
		.filter(Boolean);

	return labels.length ? labels.join(", ") : fallback;
};
