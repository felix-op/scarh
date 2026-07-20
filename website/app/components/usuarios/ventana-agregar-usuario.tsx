"use client";

import { z } from "zod";
import { VentanaFormularioRHF } from "../ui/modals";
import { TextFieldRHF } from "../formularios";
import { usePostUsuario } from "@hooks";
import { useMensajes } from "@services";
import { usuarioPostSchema } from "@utils";

const formSchema = usuarioPostSchema.extend({
  passwordConfirm: z.string().min(1, "Confirme la contraseña")
}).refine((data) => data.contraseña === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

type FormValues = z.infer<typeof formSchema>;

export interface VentanaAgregarUsuarioProps {
  open: boolean;
  onClose: () => void;
}

export function VentanaAgregarUsuario({
  open,
  onClose,
}: VentanaAgregarUsuarioProps) {
  const mensajes = useMensajes();
  const { mutate: crearUsuario, isPending } = usePostUsuario();

  const onSubmit = (data: FormValues) => {
    crearUsuario({
      first_name: data.first_name,
      last_name: data.last_name,
      nombre_usuario: data.nombre_usuario,
      legajo: data.legajo,
      email: data.email,
      contraseña: data.contraseña,
      estado: data.estado,
    }, {
      onSuccess: () => {
        mensajes.success("Creado Correctamente", `El usuario ${data.nombre_usuario} se creó correctamente.`);
        onClose();
      },
      onError: (error: Error) => {
        mensajes.error("Error al crear", error.message || "No se pudo crear el usuario");
      }
    });
  };

  return (
    <VentanaFormularioRHF<FormValues>
      open={open}
      handleClose={onClose}
      zodSchema={formSchema}
      initialValues={{
        first_name: "",
        last_name: "",
        nombre_usuario: "",
        legajo: "",
        email: "",
        contraseña: "",
        passwordConfirm: "",
        estado: true,
      }}
      onSubmit={onSubmit}
      title="Agregar Usuario"
      icon="agregar"
      isLoading={isPending}
    >
      <div className="flex flex-col gap-4 py-2">
        <TextFieldRHF
          name="first_name"
          label="Nombre"
          placeholder="Ingrese el o los nombres del usuario"
          required
        />
        <TextFieldRHF
          name="last_name"
          label="Apellido"
          placeholder="Ingrese el o los apellidos del usuario"
          required
        />
        <TextFieldRHF
          name="nombre_usuario"
          label="Nombre de usuario"
          placeholder="Ingrese el nombre de usuario"
          required
        />
        <TextFieldRHF
          name="legajo"
          label="Legajo"
          type="number"
          placeholder="Ingrese el legajo"
          required
        />
        <TextFieldRHF
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="Ingrese el correo electrónico"
          required
        />
        <TextFieldRHF
          name="contraseña"
          label="Contraseña"
          type="password"
          placeholder="Ingrese una contraseña segura"
          required
        />
        <TextFieldRHF
          name="passwordConfirm"
          label="Confirmar Contraseña"
          type="password"
          placeholder="Confirme la contraseña"
          required
        />
      </div>
    </VentanaFormularioRHF>
  );
}

export default VentanaAgregarUsuario;
