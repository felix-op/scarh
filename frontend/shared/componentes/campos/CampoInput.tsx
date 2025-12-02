type CampoInputProps = {
    id?: string;
    label: string;
    name: string;
	type: string;
	placeholder: string;
	className?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CampoInput({
    id,
    label,
    name,
	type,
	placeholder,
	className,
    value,
    onChange,
}: CampoInputProps) {
	return (
        <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-[#1E1E1E] mb-2" htmlFor={id || name}>{label}</label>
            <input
                className={`w-full p-3 px-4 bg-white rounded-lg border border-border outline-none text-base text-[#1E1E1E] ${className || ''}`}
                id={id || name}
                type={type}
                value={value}
                name={name}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
	);
}