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
	const { control, formState: { errors } } = useFormContext<T>();

	return (
		<div className="flex flex-col gap-2">
			{label && (
				<label className={`text-base font-medium text-foreground ${rules?.required && errors[name] ? 'text-red-500' : ''}`} htmlFor={name}>
					{label}
					{rules?.required && <span className="text-red-500"> *</span>}
				</label>
			)}
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