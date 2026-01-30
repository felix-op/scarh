import React from 'react';
import {
	Controller,
	useFormContext,
	FieldValues,
	Path,
	RegisterOptions
} from 'react-hook-form';

type WrapperCampoProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
	render: React.ComponentProps<typeof Controller<T>>['render'];
};

export default function WrapperCampo<T extends FieldValues>({
	name,
	label,
	rules,
	render,
}: WrapperCampoProps<T>) {
	const { control } = useFormContext<T>();

	return (
		<div className="field-container">
			{label && <label htmlFor={name}>{label}</label>}

			<Controller
				name={name}
				control={control}
				rules={rules}
				render={(params) => (
					<>
						{render(params)}

						{params.fieldState.error && (
							<span className="text-error">
								{params.fieldState.error.message}
							</span>
						)}
					</>
				)}
			/>
		</div>
	);
}