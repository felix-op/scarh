"use client";

import { ReactNode } from "react";
import {
  FormProvider,
  UseFormProps,
  useForm,
  FieldValues,
  DefaultValues,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mapServerErrorsToForm } from "@/utils/zod-rhf";

export interface FormularioProps<T extends FieldValues = FieldValues> {
  /** Esquema de validación de Zod */
  zodSchema: any;

  /** Valores iniciales del formulario */
  initialValues: DefaultValues<T>;

  /** Función a ejecutar al enviar el formulario */
  onSubmit: SubmitHandler<T>;

  /** Callback cuando el formulario se marca como sucio */
  onDirty?: () => void;

  /** Errores devueltos por el servidor mapeables a campos */
  errorResponse?: Record<string, string | string[]>;

  /** Hijo del formulario - los campos van aquí */
  children: ReactNode;

  /** Clases CSS adicionales */
  className?: string;

  /** Props adicionales de useForm */
  formProps?: Omit<UseFormProps<T>, "resolver" | "defaultValues">;

  /** Mostrar estado de cargando */
  isLoading?: boolean;
}

export function Formulario<T extends FieldValues = FieldValues>({
  zodSchema,
  initialValues,
  onSubmit,
  onDirty,
  errorResponse,
  children,
  className = "",
  formProps,
  isLoading = false,
}: FormularioProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(zodSchema) as any,
    defaultValues: initialValues,
    mode: "onSubmit",
    ...formProps,
  });

  const { handleSubmit, setError, formState } = methods;

  // Mapear errores del servidor a formulario
  if (errorResponse) {
    mapServerErrorsToForm<T>(errorResponse, setError);
  }

  // Llamar onDirty cuando el formulario se marque como sucio
  if (formState.isDirty && onDirty) {
    onDirty();
  }

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className={className} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

export default Formulario;
