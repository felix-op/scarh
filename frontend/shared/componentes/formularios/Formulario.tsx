import { ReactNode, useEffect } from "react";
import { DefaultValues, FieldValues, FormProvider, useForm, UseFormReturn } from "react-hook-form";

type FormularioProps<T extends FieldValues> = {
	valoresIniciales: DefaultValues<T>;
	className?: string;
	onSubmit: (data: T) => void;
	onDirty?: (isDirty: boolean) => void;
	children: ReactNode;
};

export default function Formulario<T extends FieldValues>({
	valoresIniciales,
	className = "",
	onSubmit,
	onDirty,
	children,
}: FormularioProps<T>) {
	const methods: UseFormReturn<T> = useForm<T>({
		defaultValues: valoresIniciales,
	});

	const { isDirty } = methods.formState;
	
	useEffect(() => {
		if (onDirty) {
			onDirty(isDirty);
		}
	}, [isDirty, onDirty]);

	return (
		<FormProvider {...methods}>
			<form className={className} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
				{children}
			</form>
		</FormProvider>
	);
}
