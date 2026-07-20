"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, BotonVolver, BotonGuardar } from "@components";
import {
  TextFieldRHF,
  SelectRHF,
  CheckboxRHF,
  DateFieldRHF,
  RadioFieldRHF,
  SegmentedControlRHF,
  SwitchRHF,
} from "@components";
import {
  emailValidator,
  positiveIntValidator,
  strongPasswordValidator,
} from "@utils";

// Ejemplo 1: TextField con validadores
const textFieldSchema = z
  .object({
    email: emailValidator,
    edad: positiveIntValidator,
    password: strongPasswordValidator,
    confirmar: z.string().min(1, "Este campo es obligatorio"),
  })
  .refine((d) => d.password === d.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

// `edad` usa `positiveIntValidator` (z.union([z.number(), z.string()]).pipe(z.coerce.number()...)):
// el tipo de entrada (lo que tipea el usuario) difiere del tipo de salida (ya coercionado a number),
// por eso se necesitan ambos tipos para tipar correctamente `useForm` y el `SubmitHandler`.
type TextFieldFormInput = z.input<typeof textFieldSchema>;
type TextFieldForm = z.output<typeof textFieldSchema>;

// Ejemplo 2: Select
const selectSchema = z.object({
  rol: z.enum(["admin", "usuario", "editor"], {
    errorMap: () => ({ message: "Este campo es obligatorio" }),
  }),
});

type SelectForm = z.infer<typeof selectSchema>;

// Ejemplo 3: Checkbox
const checkboxSchema = z.object({
  aceptaTerminos: z.boolean().refine((v) => v, {
    message: "Debes aceptar los términos",
  }),
  newsletter: z.boolean(),
});

type CheckboxForm = z.infer<typeof checkboxSchema>;

// Ejemplo 4: Switch
const switchSchema = z.object({
  notificaciones: z.boolean(),
  modo_oscuro: z.boolean(),
});

type SwitchForm = z.infer<typeof switchSchema>;

// Ejemplo 5: RadioField
const radioSchema = z.object({
  genero: z.enum(["masculino", "femenino", "otro"], {
    errorMap: () => ({ message: "Este campo es obligatorio" }),
  }),
});

type RadioForm = z.infer<typeof radioSchema>;

// Ejemplo 6: DateField
const dateSchema = z.object({
  fecha_nacimiento: z.date({
    errorMap: () => ({ message: "Este campo es obligatorio" }),
  }),
});

type DateForm = z.infer<typeof dateSchema>;

// Ejemplo 7: SegmentedControl
const segmentedSchema = z.object({
  tipo_usuario: z.enum(["basico", "premium", "enterprise"], {
    errorMap: () => ({ message: "Este campo es obligatorio" }),
  }),
});

type SegmentedForm = z.infer<typeof segmentedSchema>;

export default function DocumentacionFormulariosPage() {
  const [textFieldSuccess, setTextFieldSuccess] = useState(false);
  const [selectSuccess, setSelectSuccess] = useState(false);
  const [checkboxSuccess, setCheckboxSuccess] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [radioSuccess, setRadioSuccess] = useState(false);
  const [dateSuccess, setDateSuccess] = useState(false);
  const [segmentedSuccess, setSegmentedSuccess] = useState(false);

  const textFieldMethods = useForm<TextFieldFormInput, unknown, TextFieldForm>({
    resolver: zodResolver(textFieldSchema),
    defaultValues: {
      email: "",
      edad: undefined,
      password: "",
      confirmar: "",
    },
    mode: "onSubmit",
  });

  const selectMethods = useForm<SelectForm>({
    resolver: zodResolver(selectSchema),
    defaultValues: { rol: "usuario" },
    mode: "onSubmit",
  });

  const checkboxMethods = useForm<CheckboxForm>({
    resolver: zodResolver(checkboxSchema),
    defaultValues: { aceptaTerminos: false, newsletter: false },
    mode: "onSubmit",
  });

  const switchMethods = useForm<SwitchForm>({
    resolver: zodResolver(switchSchema),
    defaultValues: { notificaciones: false, modo_oscuro: false },
    mode: "onSubmit",
  });

  const radioMethods = useForm<RadioForm>({
    resolver: zodResolver(radioSchema),
    defaultValues: { genero: "masculino" },
    mode: "onSubmit",
  });

  const dateMethods = useForm<DateForm>({
    resolver: zodResolver(dateSchema),
    defaultValues: { fecha_nacimiento: undefined },
    mode: "onSubmit",
  });

  const segmentedMethods = useForm<SegmentedForm>({
    resolver: zodResolver(segmentedSchema),
    defaultValues: { tipo_usuario: "basico" },
    mode: "onSubmit",
  });

  const handleTextFieldSubmit = async (data: TextFieldForm) => {
    setTextFieldSuccess(true);
    setTimeout(() => setTextFieldSuccess(false), 2000);
  };

  const handleSelectSubmit = async (data: SelectForm) => {
    setSelectSuccess(true);
    setTimeout(() => setSelectSuccess(false), 2000);
  };

  const handleCheckboxSubmit = async (data: CheckboxForm) => {
    setCheckboxSuccess(true);
    setTimeout(() => setCheckboxSuccess(false), 2000);
  };

  const handleSwitchSubmit = async (data: SwitchForm) => {
    setSwitchSuccess(true);
    setTimeout(() => setSwitchSuccess(false), 2000);
  };

  const handleRadioSubmit = async (data: RadioForm) => {
    setRadioSuccess(true);
    setTimeout(() => setRadioSuccess(false), 2000);
  };

  const handleDateSubmit = async (data: DateForm) => {
    setDateSuccess(true);
    setTimeout(() => setDateSuccess(false), 2000);
  };

  const handleSegmentedSubmit = async (data: SegmentedForm) => {
    setSegmentedSuccess(true);
    setTimeout(() => setSegmentedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground-title">
            React Hook Form + Zod
          </h1>
          <p className="text-foreground-secondary">
            Ejemplos interactivos de cada componente con validación
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      {/* Ejemplo 1: TextField */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            TextFieldRHF - Validadores
          </h2>
          <p className="text-foreground-secondary text-sm">
            Email válido, edad positiva, contraseña fuerte con confirmación
          </p>
        </div>

        <FormProvider {...textFieldMethods}>
          <form
            onSubmit={textFieldMethods.handleSubmit(handleTextFieldSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextFieldRHF
              name="email"
              label="Email"
              type="email"
              placeholder="usuario@example.com"
              required
            />

            <TextFieldRHF
              name="edad"
              label="Edad"
              type="number"
              placeholder="25"
              required
            />

            <TextFieldRHF
              name="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              required
            />

            <TextFieldRHF
              name="confirmar"
              label="Confirmar Contraseña"
              type="password"
              placeholder="••••••••"
              required
            />

            {textFieldSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Validado correctamente
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 2: Select */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">SelectRHF</h2>
          <p className="text-foreground-secondary text-sm">
            Selector dropdown con validación enum
          </p>
        </div>

        <FormProvider {...selectMethods}>
          <form
            onSubmit={selectMethods.handleSubmit(handleSelectSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <SelectRHF
              name="rol"
              label="Rol de Usuario"
              options={[
                { value: "usuario", label: "Usuario Regular" },
                { value: "editor", label: "Editor" },
                { value: "admin", label: "Administrador" },
              ]}
              required
            />

            {selectSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Rol seleccionado
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 3: Checkbox */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">CheckboxRHF</h2>
          <p className="text-foreground-secondary text-sm">
            Validación requerida y checkbox opcional
          </p>
        </div>

        <FormProvider {...checkboxMethods}>
          <form
            onSubmit={checkboxMethods.handleSubmit(handleCheckboxSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <CheckboxRHF
              name="aceptaTerminos"
              label="Términos y condiciones"
              description="Acepto los términos de servicio"
              required
            />

            <CheckboxRHF
              name="newsletter"
              label="Newsletter"
              description="Deseo recibir actualizaciones por email"
            />

            {checkboxSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Preferencias guardadas
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 4: Switch */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">SwitchRHF</h2>
          <p className="text-foreground-secondary text-sm">
            Toggles booleanos para preferencias
          </p>
        </div>

        <FormProvider {...switchMethods}>
          <form
            onSubmit={switchMethods.handleSubmit(handleSwitchSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <SwitchRHF
              name="notificaciones"
              label="Notificaciones"
              description="Recibir notificaciones push"
            />

            <SwitchRHF
              name="modo_oscuro"
              label="Modo Oscuro"
              description="Activar tema oscuro"
            />

            {switchSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Ajustes actualizados
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 5: RadioField */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">RadioFieldRHF</h2>
          <p className="text-foreground-secondary text-sm">
            Selección única entre opciones
          </p>
        </div>

        <FormProvider {...radioMethods}>
          <form
            onSubmit={radioMethods.handleSubmit(handleRadioSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <RadioFieldRHF
              name="genero"
              id="masculino"
              label="Masculino"
              description="Masculino"
              required
            />

            <RadioFieldRHF
              name="genero"
              id="femenino"
              label="Femenino"
              description="Femenino"
            />

            <RadioFieldRHF
              name="genero"
              id="otro"
              label="Otro"
              description="Prefiero no especificar"
            />

            {radioSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Opción seleccionada
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 6: DateField */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">DateFieldRHF</h2>
          <p className="text-foreground-secondary text-sm">
            Selector de fecha con calendario
          </p>
        </div>

        <FormProvider {...dateMethods}>
          <form
            onSubmit={dateMethods.handleSubmit(handleDateSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <DateFieldRHF
              name="fecha_nacimiento"
              label="Fecha de Nacimiento"
              placeholder="Selecciona una fecha"
              required
            />

            {dateSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Fecha registrada
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Ejemplo 7: SegmentedControl */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            SegmentedControlRHF
          </h2>
          <p className="text-foreground-secondary text-sm">
            Control segmentado para selección visual
          </p>
        </div>

        <FormProvider {...segmentedMethods}>
          <form
            onSubmit={segmentedMethods.handleSubmit(handleSegmentedSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Tipo de Plan <span className="text-error">*</span>
              </label>
              <SegmentedControlRHF
                name="tipo_usuario"
                options={[
                  { value: "basico", label: "Básico" },
                  { value: "premium", label: "Premium" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
              />
            </div>

            {segmentedSuccess && (
              <div className="p-2 bg-success-light/20 text-success rounded text-sm">
                ✓ Plan seleccionado
              </div>
            )}

            <BotonGuardar type="submit" />
          </form>
        </FormProvider>
      </Card>

      {/* Referencia de Validadores */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          Validadores Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-background-default rounded border border-border">
            <p className="font-mono text-primary-main">emailValidator</p>
            <p className="text-foreground-secondary">Formato de email válido</p>
          </div>
          <div className="p-3 bg-background-default rounded border border-border">
            <p className="font-mono text-primary-main">positiveIntValidator</p>
            <p className="text-foreground-secondary">Enteros positivos</p>
          </div>
          <div className="p-3 bg-background-default rounded border border-border">
            <p className="font-mono text-primary-main">numberValidator</p>
            <p className="text-foreground-secondary">Números positivos</p>
          </div>
          <div className="p-3 bg-background-default rounded border border-border">
            <p className="font-mono text-primary-main">strongPasswordValidator</p>
            <p className="text-foreground-secondary">8+, mayús, minús, número, especial</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
