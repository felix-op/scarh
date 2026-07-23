import { z } from "zod";
import { FieldError, FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Validadores comunes para formularios con Zod
 */

export const emailValidator = z
  .string()
  .email("Debe ser un email válido")
  .toLowerCase();

export const numberValidator = z
  .union([z.number(), z.string()])
  .pipe(z.coerce.number().positive("Debe ser un número positivo"));

export const positiveIntValidator = z
  .union([z.number(), z.string()])
  .pipe(z.coerce.number().int("Debe ser un número entero").positive("Debe ser un número positivo"));

export const alphanumericValidator = z
  .string()
  .regex(/^[a-zA-Z0-9_-]*$/, "Solo letras, números, guiones y guiones bajos permitidos");

export const alphanumericWithSpecialValidator = z
  .string()
  .min(1, "No puede estar vacío")
  .regex(
    /^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).*$/,
    "Debe contener al menos una letra o número y un carácter especial"
  );

export const strongPasswordValidator = z
  .string()
  .min(8, "Debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/, "Debe contener al menos un carácter especial");

export const urlValidator = z
  .string()
  .url("Debe ser una URL válida");

export const dateValidator = z
  .date()
  .refine((date) => date <= new Date(), {
    message: "La fecha no puede ser en el futuro",
  });

/**
 * Función para mapear errores de respuesta del servidor a react-hook-form
 * Útil cuando la API devuelve errores asociados a campos específicos
 *
 * Formato esperado de la respuesta:
 * {
 *   errors: {
 *     "campo1": "Mensaje de error",
 *     "campo2": ["Error 1", "Error 2"]
 *   }
 * }
 */
export function mapServerErrorsToForm<T extends FieldValues>(
  errors: Record<string, string | string[]> | undefined,
  setError: UseFormSetError<T>
): void {
  if (!errors) return;

  Object.entries(errors).forEach(([fieldName, errorMessages]) => {
    const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
    setError(fieldName as Path<T>, {
      type: "server",
      message: messages[0],
    });
  });
}

/**
 * Función auxiliar para generar esquemas con validación condicional
 */
export function createConditionalSchema<T extends z.ZodRawShape>(
  shape: T,
  refinements?: (schema: z.ZodObject<T>) => z.ZodObject<T>
) {
  const schema = z.object(shape);
  return refinements ? refinements(schema) : schema;
}

/**
 * Wrapper para ejecutar validación de Zod y capturar errores de forma amigable
 */
export async function validateWithZod<T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.flatten().fieldErrors;
      const errors: Record<string, string> = {};

      Object.entries(formattedErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages[0];
        }
      });

      return { success: false, errors };
    }
    return { success: false, errors: { _root: "Error de validación desconocido" } };
  }
}

/**
 * Tipo helper para obtener el tipo inferido de un esquema Zod
 */
export type ZodInfer<T extends z.ZodSchema> = z.infer<T>;

/**
 * Convierte un string de formulario a número. Retorna null si está vacío o es inválido.
 * Útil para campos numéricos que el backend espera como number | null.
 */
export const toNum = (s?: string): number | null => (s && s.trim() !== "" ? Number(s) : null);

/**
 * Convierte un número del backend (number | null | undefined) a string para campos de formulario.
 * Útil para hidratar formularios.
 */
export const toStr = (n: number | null | undefined): string => (n != null ? String(n) : "");
