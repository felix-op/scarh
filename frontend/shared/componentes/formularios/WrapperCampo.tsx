import React from 'react';
import {
	Controller,
	useFormContext,
	FieldValues,
	Path,
	RegisterOptions
} from 'react-hook-form';
import Label from './Label';

type WrapperCampoProps<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
	render: React.ComponentProps<typeof Controller<T>>['render'];
	layout?: 'stack' | 'row' | 'row-reverse';
	disabled?: boolean;
};

export default function WrapperCampo<T extends FieldValues>({
	name,
	label,
	rules,
	render,
	layout = 'stack',
	disabled = false,
}: WrapperCampoProps<T>) {
	const { control, formState: { errors } } = useFormContext<T>();

	const containerClasses = layout === 'stack'
		? ""
		: "flex flex-row items-center gap-2";


	const labelElement = label && (
		<Label name={name} disabled={disabled} text={label} required={!!rules?.required} error={!!errors[name]} />
	);

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			render={(params) => (
				<div className='flex flex-col gap-2'>
					{layout !== 'row-reverse' && labelElement}
					<div className={containerClasses}>
						{render(params)}
						{layout === 'row-reverse' && labelElement}
					</div>
					{params.fieldState.error && (
						<span className="text-error">
							{params.fieldState.error.message}
						</span>
					)}
				</div>
			)}
		/>
	);
}